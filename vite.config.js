import { resolve } from "path";
import { rollup } from "rollup";

export default {
    root:'./src',
    build: {
        lib: {
            entry: [resolve(__dirname, '/background/background.html'), resolve(__dirname, '/mainPopup/popup.html')],
            name: 'myLib'
        },
        outDir:'../dist',
        rollupOptions: {
            output: {
                preserveModules: true,
            }
        }
    }
}