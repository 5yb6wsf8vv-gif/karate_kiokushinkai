export async function navigate(page,name){
 const link=page.getByRole('link',{name,exact:true});
 if(!await link.isVisible()){
  const toggle=page.getByRole('button',{name:'☰ Разделы',exact:true});
  if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='false')await toggle.click();
 }
 await link.click();
}
