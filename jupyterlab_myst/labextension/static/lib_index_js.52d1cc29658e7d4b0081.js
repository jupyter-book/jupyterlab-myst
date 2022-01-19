(self["webpackChunkjupyterlab_myst"] = self["webpackChunkjupyterlab_myst"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _plugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./plugin */ "./lib/plugin.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([_plugin__WEBPACK_IMPORTED_MODULE_0__.plugin]);


/***/ }),

/***/ "./lib/plugin.js":
/*!***********************!*\
  !*** ./lib/plugin.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "plugin": () => (/* binding */ plugin)
/* harmony export */ });
/* harmony import */ var _agoose77_jupyterlab_markup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @agoose77/jupyterlab-markup */ "webpack/sharing/consume/default/@agoose77/jupyterlab-markup");
/* harmony import */ var _agoose77_jupyterlab_markup__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_agoose77_jupyterlab_markup__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tokens__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tokens */ "./lib/tokens.js");
/* harmony import */ var markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! markdown-it-myst */ "webpack/sharing/consume/default/markdown-it-myst");
/* harmony import */ var markdown_it_myst__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__);



function mystPlugin(md, options) {
    md.use(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__.plugins.blocks);
    md.use(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__.plugins.directives(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__.directives));
    md.use(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__.plugins.roles(markdown_it_myst__WEBPACK_IMPORTED_MODULE_1__.roles));
}
/**
 * Provides text-based diagrams in code plugin
 */
const plugin = (0,_agoose77_jupyterlab_markup__WEBPACK_IMPORTED_MODULE_0__.simpleMarkdownItPlugin)(_tokens__WEBPACK_IMPORTED_MODULE_2__.PACKAGE_NS, {
    id: 'markdown-it-myst',
    title: 'MyST',
    description: 'Javascript markdown parser for MyST based on markdown-it',
    documentationUrls: {
        Plugin: 'https://github.com/executablebooks/markdown-it-myst'
    },
    examples: {
        'MyST ': '```{directive}\n' + ':option: value\n' + '\n' + 'content\n' + '```'
    },
    plugin: async () => {
        console.log("MyST loaded");
        return [mystPlugin];
    }
});


/***/ }),

/***/ "./lib/tokens.js":
/*!***********************!*\
  !*** ./lib/tokens.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PACKAGE_NS": () => (/* binding */ PACKAGE_NS)
/* harmony export */ });
/**
 * The ID stem for all plugins
 */
const PACKAGE_NS = '@agoose77/jupyterlab-markup';


/***/ })

}]);
//# sourceMappingURL=lib_index_js.52d1cc29658e7d4b0081.js.map