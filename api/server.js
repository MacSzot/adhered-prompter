import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg'; import ffmpegPath from 'ffmpeg-static';
import fs from 'fs'; import OpenAI from 'openai';
ffmpeg.setFfmpegPath(ffmpegPath);
const app=express(); app.use(cors()); const upload=multer({storage:multer.memoryStorage()});
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

function toWav16k(buffer){return new Promise((resolve,reject)=>{
  const inP=`/tmp/in-${Date.now()}.webm`, outP=`/tmp/out-${Date.now()}.wav`;
  fs.writeFileSync(inP,buffer);
  ffmpeg(inP).audioChannels(1).audioFrequency(16000).format('wav')
    .on('end',()=>{const w=fs.readFileSync(outP); fs.unlinkSync(inP); fs.unlinkSync(outP); resolve(w)})
    .on('error',e=>{try{fs.unlinkSync(inP)}catch{} reject(e)}).save(outP);
});}

app.post('/api/whisper', upload.single('file'), async (req,res)=>{
  try{
    const wav=await toWav16k(req.file.buffer); const tmp=`/tmp/clip-${Date.now()}.wav`; fs.writeFileSync(tmp,wav);
    const r=await openai.audio.transcriptions.create({file:fs.createReadStream(tmp), model:'whisper-1', language:'pl'});
    try{fs.unlinkSync(tmp)}catch{}; res.json({text:r.text||''});
  }catch(e){console.error(e); res.status(500).json({error:'whisper_failed'})}
});
app.listen(process.env.PORT||8080,()=>console.log('API on',process.env.PORT||8080));
