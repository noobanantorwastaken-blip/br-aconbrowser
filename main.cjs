const {app,BrowserWindow,session,shell}=require('electron');
const path=require('path');
function createWindow(){const win=new BrowserWindow({width:1500,height:950,minWidth:1000,minHeight:650,backgroundColor:'#09070b',title:'Bacon Browser',webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webviewTag:true}});win.loadFile(path.join(__dirname,'index.html'));win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/i.test(url)){shell.openExternal(url);}return {action:'deny'};});return win;}
app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((wc,p,cb)=>cb(['fullscreen','media'].includes(p)));createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
