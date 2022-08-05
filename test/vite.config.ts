
//import { viteSingleFile } from "vite-plugin-singlefile"
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
//import vue from '@vitejs/plugin-vue'

export default defineConfig({
    base: '',
    //plugins: [vue()]
    plugins: [viteSingleFile()],
}) 