// Optional authoring tool; generated files are checked in. FFmpeg is not needed to run Last Call.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const output=fileURLToPath(new URL('../src/media/',import.meta.url));
mkdirSync(output,{recursive:true});
const font="fontfile='C\\:/Windows/Fonts/georgia.ttf'";
const clips=[
  {file:'orbit.mp4',title:'ORBITAL DRIFT',line:'A little perspective from the edge of the bar.',color:'0x101d32',accent:'0x8cbcc9',symbol:'O'},
  {file:'ocean.mp4',title:'DEEP BLUE SIGNALS',line:'Even the quiet corners have a story.',color:'0x092c31',accent:'0x75d6bf',symbol:'~'},
  {file:'arcade.mp4',title:'NEON GRID',line:'There is always time for one more quarter.',color:'0x261332',accent:'0xdf9dd5',symbol:'+'},
];
for(const clip of clips) {
  const filter=[
    `color=c=${clip.color}:s=960x540:r=24`,
    `drawgrid=w=80:h=80:t=1:c=${clip.accent}@0.12`,
    `drawtext=${font}:text='${clip.symbol}':fontsize=360:fontcolor=${clip.accent}@0.18:x='(w-text_w)/2+170*sin(t/4)':y='(h-text_h)/2+35*cos(t/3)'`,
    `drawtext=${font}:text='LAST CALL / ORIGINAL SILENT DEMO':fontsize=17:fontcolor=0xeac27b:x=55:y=45`,
    `drawtext=${font}:text='${clip.title}':fontsize=48:fontcolor=0xf1f0e8:x='(w-text_w)/2':y=230`,
    `drawtext=${font}:text='${clip.line}':fontsize=22:fontcolor=${clip.accent}:x='(w-text_w)/2':y=305`,
    `drawtext=${font}:text='You picked the door. Thanks for dropping by.':fontsize=18:fontcolor=0xeac27b:x='(w-text_w)/2':y='430+5*sin(t)'`,
    'fade=t=in:st=0:d=1,fade=t=out:st=16:d=2',
  ].join(',');
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i',filter,'-t','18','-an','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',`${output}/${clip.file}`],{stdio:'inherit'});
  if(result.status!==0) throw new Error('FFmpeg could not create the original demo segment.');
}
