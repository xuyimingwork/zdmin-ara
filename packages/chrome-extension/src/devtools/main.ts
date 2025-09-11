const PANEL_TITLE = 'OpenAPI CodeGen'

chrome.devtools.panels.create(
  PANEL_TITLE, 
  '/icons/128.png', 
  '/pages/devtools/openapi-codegen-panel.html', 
  panel => {
    console.log(`${PANEL_TITLE} panel created:`, panel);
  }
)