// vscode-systemd
// Copyright (C) 2026 Dominik Viererbe <hello@dviererbe.de>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { IActionContext } from "@dviererbe/vscode-utils";
import { SystemdAnalyzeCommand } from "../../clients/SystemdAnalyzeCommand";
import * as vscode from "vscode";

export async function showPlotView(context: IActionContext): Promise<void>
{
    context.errorHandling.suppressDisplay = false;

    const plotSvg = await SystemdAnalyzeCommand.plot();

    const webViewPanel = vscode.window.createWebviewPanel(
        "vscode-systemd.plot",
        "systemd-analyze plot",
        vscode.ViewColumn.Active,
        {
            enableScripts: true,
            enableForms: false,
            enableCommandUris: false,
            enableFindWidget: false,
            localResourceRoots: [],
            retainContextWhenHidden: true
        });

    webViewPanel.webview.html = buildPlotHtml(webViewPanel.webview, plotSvg);
}

/**
 * Builds an HTML wrapper around the raw `systemd-analyze plot` SVG and adds
 * interactive pan/zoom controls.
 *
 * The SVG includes fixed `width` and `height` attributes that force full-size
 * rendering in a VS Code webview. We remove those dimensions, add a `viewBox`,
 * and use an inline script plus CSS transforms so the user can zoom, pan,
 * reset, and fit the diagram to the viewport.
 */
function buildPlotHtml(webview: vscode.Webview, svg: string): string
{
    // Strip the XML prolog and DOCTYPE so the SVG can be inlined into HTML.
    let inlineSvg = svg
        .replace(/<\?xml[^>]*\?>/i, "")
        .replace(/<!DOCTYPE[^>]*>/i, "")
        .trimStart();

    // Pull the explicit pixel dimensions off the root <svg> element so we can
    // turn them into a viewBox and know the diagram's intrinsic size.
    const widthMatch = inlineSvg.match(/<svg[^>]*\bwidth="(\d+(?:\.\d+)?)(?:px)?"/i);
    const heightMatch = inlineSvg.match(/<svg[^>]*\bheight="(\d+(?:\.\d+)?)(?:px)?"/i);
    const svgWidth = widthMatch ? Number(widthMatch[1]) : 0;
    const svgHeight = heightMatch ? Number(heightMatch[1]) : 0;

    inlineSvg = inlineSvg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) =>
    {
        let cleaned = attrs
            .replace(/\s+width="[^"]*"/i, "")
            .replace(/\s+height="[^"]*"/i, "");

        if (svgWidth && svgHeight && !/\bviewBox=/i.test(cleaned))
        {
            cleaned += ` viewBox="0 0 ${svgWidth} ${svgHeight}"`;
        }

        cleaned += ` preserveAspectRatio="xMidYMin meet"`;
        return `<svg${cleaned}>`;
    });

    /**
     * Generates a random nonce used to allow the inline pan/zoom script under the
     * webview's Content Security Policy.
     */
    const nonce = generateNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <style>
        html, body
        {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
        }
        body
        {
            background: #ffffff;
        }

        #viewport
        {
            position: absolute;
            inset: 0;
            overflow: hidden;
        }

        #viewport.dragPan
        {
            cursor: grab;
            user-select: none;
        }

        #viewport.dragPan.dragging
        {
            cursor: grabbing;
        }

        #canvas
        {
            position: absolute;
            top: 0;
            left: 0;
            width: ${svgWidth || 100}px;
            height: ${svgHeight || 100}px;
            transform-origin: 0 0;
            will-change: transform;
        }

        #canvas svg
        {
            display: block;
            width: 100%;
            height: 100%;
        }

        #toolbar
        {
            position: fixed;
            bottom: 12px;
            left: 12px;
            padding: 6px;
            border-radius: 8px;
            background: var(--vscode-editorWidget-background, rgba(40, 40, 40, 0.85));
            border: 1px solid var(--vscode-editorWidget-border, rgba(0, 0, 0, 0.2));
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            z-index: 10;
            user-select: none;

            display: grid;
            grid-template-columns: repeat(3, 32px);
            grid-auto-rows: repeat(auto, 32px);
            grid-template-areas:
                "reset . zoomIn"
                "fit . zoomOut"
                "zoomLabel zoomLabel zoomLabel"
                ". up ."
                "left dragPan right"
                ". down .";
            gap: 4px;
            justify-content: center;
            place-items: center;
        }

        #toolbar button
        {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
            border: 1px solid var(--vscode-button-border, transparent);
            border-radius: 4px;
            color: var(--vscode-button-foreground, #fff);
            background: var(--vscode-button-background, #0e639c);
        }

        #toolbar button:hover
        {
            background: var(--vscode-button-hoverBackground, #1177bb);
        }

        #zoomLabel
        {
            grid-area: zoomLabel;
            text-align: center;
            font: 11px var(--vscode-font-family, sans-serif);
            color: var(--vscode-foreground, #ccc);
            padding: 2px 0;
        }
    </style>
</head>
<body>
    <div id="viewport">
        <div id="canvas">
${inlineSvg}
        </div>
    </div>
    <div id="toolbar">
      <button id="up" class="horizontal" title="pan up" style="grid-area: up;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/></svg></button>
      <button id="left" class="vertical" title="pan left" style="grid-area: left;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg></button>
      <button id="dragPanDisable" style="grid-area: dragPan;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-index-fill" viewBox="0 0 16 16"><path d="M8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v5.34l-1.2.24a1.5 1.5 0 0 0-1.196 1.636l.345 3.106a2.5 2.5 0 0 0 .405 1.11l1.433 2.15A1.5 1.5 0 0 0 6.035 16h6.385a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5 5 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.6 2.6 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046z"/></svg></button>
      <button id="dragPanEnable" style="grid-area: dragPan;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cursor-text" viewBox="0 0 16 16"><path d="M5 2a.5.5 0 0 1 .5-.5c.862 0 1.573.287 2.06.566.174.099.321.198.44.286.119-.088.266-.187.44-.286A4.17 4.17 0 0 1 10.5 1.5a.5.5 0 0 1 0 1c-.638 0-1.177.213-1.564.434a3.5 3.5 0 0 0-.436.294V7.5H9a.5.5 0 0 1 0 1h-.5v4.272c.1.08.248.187.436.294.387.221.926.434 1.564.434a.5.5 0 0 1 0 1 4.17 4.17 0 0 1-2.06-.566A5 5 0 0 1 8 13.65a5 5 0 0 1-.44.285 4.17 4.17 0 0 1-2.06.566.5.5 0 0 1 0-1c.638 0 1.177-.213 1.564-.434.188-.107.335-.214.436-.294V8.5H7a.5.5 0 0 1 0-1h.5V3.228a3.5 3.5 0 0 0-.436-.294A3.17 3.17 0 0 0 5.5 2.5.5.5 0 0 1 5 2m2.648 10.645"/></svg></button>
      <button id="right" class="vertical" title="pan right" style="grid-area: right;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg></button>
      <button id="down" class="horizontal" title="pan down" style="grid-area: down;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg></button>
      <div id="zoomLabel">100%</div>
      <button id="zoomIn" title="zoom in" style="grid-area: zoomIn;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/><path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5"/></svg></button>
      <button id="zoomOut" title="zoom out" style="grid-area: zoomOut;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/><path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/></svg></button>
      <button id="fit" title="fit to view" style="grid-area: fit;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707M15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707"/></svg></button>
      <button id="reset" title="reset view" style="grid-area: reset;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/></svg></button>
    </div>
    <script nonce="${nonce}">
        (function () {
            const SVG_WIDTH = ${svgWidth || 0};
            const SVG_HEIGHT = ${svgHeight || 0};
            const ZOOM_STEP = 1.2;
            const MIN_SCALE = 0.02;
            const MAX_SCALE = 20;
            const PAN_STEP = 120; // pixels per pan-button press

            const viewport = document.getElementById("viewport");
            const canvas = document.getElementById("canvas");
            const zoomLabel = document.getElementById("zoomLabel");

            let scale = 1, tx = 0, ty = 0;

            function clamp(value, min, max)
            {
                return Math.min(max, Math.max(min, value));
            }

            function apply()
            {
                canvas.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
                zoomLabel.textContent = Math.round(scale * 100) + "%";
            }

            // Fit the diagram to the viewport width and align it to the top.
            function fit()
            {
                if (!SVG_WIDTH || !SVG_HEIGHT)
                {
                    scale = 1;
                    tx = 0;
                    ty = 0;
                }
                else
                {
                    const rect = viewport.getBoundingClientRect();
                    scale = clamp(rect.width / SVG_WIDTH, MIN_SCALE, MAX_SCALE);
                    tx = (rect.width - SVG_WIDTH * scale) / 2;
                    ty = 0;
                }

                apply();
            }

            function reset()
            {
                scale = 1;
                tx = 0;
                ty = 0;
                apply();
            }

            // Zoom keeping the given viewport point (cx, cy) anchored.
            function zoomAt(cx, cy, factor)
            {
                const next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
                if (next === scale) return;
                tx = cx - (cx - tx) * (next / scale);
                ty = cy - (cy - ty) * (next / scale);
                scale = next;
                apply();
            }

            function zoomCenter(factor)
            {
                const rect = viewport.getBoundingClientRect();
                zoomAt(rect.width / 2, rect.height / 2, factor);
            }

            function panBy(dx, dy) { tx += dx; ty += dy; apply(); }

            document.getElementById("zoomIn").addEventListener("click", () => zoomCenter(ZOOM_STEP));
            document.getElementById("zoomOut").addEventListener("click", () => zoomCenter(1 / ZOOM_STEP));
            document.getElementById("fit").addEventListener("click", fit);
            document.getElementById("reset").addEventListener("click", reset);
            document.getElementById("up").addEventListener("click", () => panBy(0, PAN_STEP));
            document.getElementById("down").addEventListener("click", () => panBy(0, -PAN_STEP));
            document.getElementById("left").addEventListener("click", () => panBy(PAN_STEP, 0));
            document.getElementById("right").addEventListener("click", () => panBy(-PAN_STEP, 0));

            // Drag-to-pan, off by default so text stays selectable. The two
            // buttons toggle each other's visibility; the .dragPan class on the
            // viewport handles the grab cursor and disables text selection.
            let dragPanActive = false;
            let dragging = false, lastX = 0, lastY = 0;

            const dragPanDisable = document.getElementById("dragPanDisable");
            const dragPanEnable = document.getElementById("dragPanEnable");
            dragPanDisable.style.display = dragPanActive ? 'flex' : 'none';
            dragPanEnable.style.display = dragPanActive ? 'none' : 'flex';

            dragPanDisable.addEventListener("click", () =>
            {
                dragPanDisable.style.display = 'none';
                dragPanEnable.style.display = 'flex';

                dragPanActive = false;
                dragging = false;
                viewport.classList.remove("dragPan", "dragging");
            });

            dragPanEnable.addEventListener("click", () =>
            {
                dragPanEnable.style.display = 'none';
                dragPanDisable.style.display = 'flex';

                dragPanActive = true;
                viewport.classList.add("dragPan");
            });

            viewport.addEventListener("pointerdown", (e) =>
            {
                if (!dragPanActive) return;
                dragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
                viewport.classList.add("dragging");
                viewport.setPointerCapture(e.pointerId);
            });

            viewport.addEventListener("pointermove", (e) =>
            {
                if (!dragging) return;
                panBy(e.clientX - lastX, e.clientY - lastY);
                lastX = e.clientX;
                lastY = e.clientY;
            });

            const endDrag = (e) =>
            {
                if (!dragging) return;
                dragging = false;
                viewport.classList.remove("dragging");

                if (e.pointerId !== undefined && viewport.hasPointerCapture(e.pointerId))
                {
                    viewport.releasePointerCapture(e.pointerId);
                }
            };
            viewport.addEventListener("pointerup", endDrag);
            viewport.addEventListener("pointercancel", endDrag);

            // Wheel: zoom with Ctrl/Cmd, otherwise scroll/pan.
            viewport.addEventListener("wheel", (e) => {
                e.preventDefault();
                if (e.ctrlKey || e.metaKey) {
                    const rect = viewport.getBoundingClientRect();
                    zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP);
                } else {
                    panBy(-e.deltaX, -e.deltaY);
                }
            }, { passive: false });

            // Keyboard: +/- to zoom, arrows to pan, 0 to fit.
            window.addEventListener("keydown", (e) => {
                if (e.key === "+" || e.key === "=") { zoomCenter(ZOOM_STEP); e.preventDefault(); }
                else if (e.key === "-") { zoomCenter(1 / ZOOM_STEP); e.preventDefault(); }
                else if (e.key === "0") { fit(); e.preventDefault(); }
                else if (e.key === "ArrowUp") { panBy(0, PAN_STEP); e.preventDefault(); }
                else if (e.key === "ArrowDown") { panBy(0, -PAN_STEP); e.preventDefault(); }
                else if (e.key === "ArrowLeft") { panBy(PAN_STEP, 0); e.preventDefault(); }
                else if (e.key === "ArrowRight") { panBy(-PAN_STEP, 0); e.preventDefault(); }
            });

            window.addEventListener("resize", () => apply());

            fit();
        })();
    </script>
</body>
</html>`;
}

function generateNonce(): string
{
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 32; i++)
    {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}
