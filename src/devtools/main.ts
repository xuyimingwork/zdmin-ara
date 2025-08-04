console.log('Hello Zdmin Ara!');

chrome.devtools.panels.create(
  'OpenAPI CodeGen', 
  '/icons/128.png', 
  '/pages/devtools/openapi-codegen-panel.html', 
  panel => {
    console.log('DevTools panel created:', panel);
  }
)