# architecture

## frontend

- responsibility
  - get OpenAPI document
  - ui of backend

- technology
  - use browser extension: extension can bypass auth of getting OpenAPI document

## backend

- responsibility
  - receive OpenAPI document and generate client code
  - provide standard api for interact with frontend

- technology
  - a standalone http service?
  - integration with popular bundler like vite or webpack

## trade off

There ara two options: thin frontend or thin backend. 

- thin backend: backend just responsible for receive and then write data to local file system, let frontend do things like transform OpenAPI document to js/ts client code

- thin frontend: backend care about transform OpenAPI document to js/ts client code, frontend only for get OpenAPI document and transfer it to backend

since internal OpenAPI document behind auth in common, we can use browser extension make use of existing browser auth process to bypass auth.

but there are so many limitation of browser extension and it is hard for us to make user customize generating process, even add new code gen like generate Java code.

so, we choose thin frontend.    