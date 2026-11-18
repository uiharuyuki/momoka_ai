import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const css=readFileSync(new URL('../src/pages/TalkDesign.css',import.meta.url),'utf8')
test('the intermediate-width hero crops at a deliberate upper-body scale, not a height-limited contain',()=>{
 const tablet=css.slice(css.indexOf('@media (min-width: 721px) and (max-width: 1000px)'),css.indexOf('@media (min-width: 721px) and (max-height: 860px)'))
 assert.match(tablet,/width: min\(64%, 510px\); object-fit: cover; object-position: center top/)
 assert.doesNotMatch(tablet,/object-fit: contain/)
})
test('short desktop windows scroll rather than shrinking the hero and composer',()=>{
 assert.match(css,/@media \(min-width: 721px\) and \(max-height: 860px\)[\s\S]*body\.talk-is-open \{ height: auto; overflow-y: auto;/)
 assert.match(css,/\.site-shell-talk \{ height: 860px; min-height: 860px; overflow: visible;/)
})
