import { format } from "path";
import {rollupPluginHTML as html} from '@web/rollup-plugin-html';
import copy from "rollup-plugin-copy-assets";

export default [
    {
        input: './src/background/background.html',
        output: {
            dir: './dist/background',
            format: 'es',
        },
        plugins:[html(), copy({
            assets: [
                '../manifest.json',
            ]
        })]
    },
    {
        input: './src/mainPopup/popup.html',
        output: {
            dir: './dist/mainPopup',
            format: 'es',
        },
        plugins:[html()]
    },
]