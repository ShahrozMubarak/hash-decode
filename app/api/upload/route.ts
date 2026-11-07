import {adminAccess,sameOrigin} from '@/lib/studio-security';

export async function POST(req:Request){
  if(!sameOrigin(req))return Response.json({error:'Untrusted request.'},{status:403});
  if(!(await adminAccess(req)).allowed)return Response.json({error:'Sign in to continue.'},{status:401});

  try{
    const formData=await req.formData();
    const file=formData.get('file') as File|null;
    if(!file)return Response.json({error:'No file provided.'},{status:400});

    if(!file.type.startsWith('image/'))return Response.json({error:'Please select an image file.'},{status:400});
    if(file.size>5*1024*1024)return Response.json({error:'Image file is too large (max 5MB).'},{status:400});

    const buffer=await file.arrayBuffer();
    const base64=Buffer.from(buffer).toString('base64');
    const dataUrl=`data:${file.type};base64,${base64}`;

    return Response.json({ok:true,url:dataUrl});
  }catch{
    return Response.json({error:'Could not upload file.'},{status:500});
  }
}

