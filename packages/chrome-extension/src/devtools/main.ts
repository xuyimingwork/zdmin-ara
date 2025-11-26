import axios from "axios";
import { upperCase } from "es-toolkit";

const PANEL_TITLE = 'Ara'

axios('/meta.json').then(res => res.data).catch(() => '')
  .then((meta) => {
    chrome.devtools.panels.create(
      PANEL_TITLE + (meta?.source ? ` (${upperCase(meta?.source)})` : ''), 
      '/icons/128.png', 
      '/pages/devtools/openapi-codegen-panel.html', 
      panel => {
        console.log(`${PANEL_TITLE} panel created:`, panel);
      }
    )
  })

