import { Router,Request,Response } from 'express';
import multer from 'multer';

import S3Storage from '../utils/S3Storage';


const routes = Router();
const upload = multer({ dest: 'uploads/' });

routes.post('/', upload.single('image'), async (req:Request, res:Response) => {
  const { file } = req;


  if(file){
    const response = S3Storage.savefile(file);
    return res.json({ success: true,response });
  }
  
  return res.json({ success: false });
});

routes.delete('/:filename', async (req:Request, res:Response) => {
  const { filename } = req.params;

  await S3Storage.deleteFile(filename);

  return res.json({message:`${filename} deletado!` });
});

routes.get('/get/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;

  const response = S3Storage.getFileStream(filename);

  response.on('error', (err: any) => {
    if (err.code === 'AccessDenied') {
      return res.status(403).json({ error: 'Acesso negado ao acessar o arquivo' });
    }
    // Outros erros
    return res.status(500).json({ error: 'Erro ao acessar o arquivo' });
  });

  response.pipe(res);
});

export default routes;
