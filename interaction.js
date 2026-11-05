// Normal one-finger scrolling stays native. Only page magnification gestures
// are cancelled; text fields retain selection, editing and the system keyboard.
export function installTouchBehaviour(target=document){
 const stopZoom=event=>event.preventDefault();
 for(const type of ['gesturestart','gesturechange','gestureend'])target.addEventListener(type,stopZoom,{passive:false});
 const stopMultiTouch=event=>{if(event.touches.length>1)event.preventDefault()};
 target.addEventListener('touchstart',stopMultiTouch,{passive:false});
 target.addEventListener('touchmove',stopMultiTouch,{passive:false});
}
