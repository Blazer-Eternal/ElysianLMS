/**
 * Theme bootstrap that must run before first paint (no light flash).
 * Kept in a client-boundary-free module so the server layout can inline it.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("elysian.theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;if(d){r.classList.add("dark");r.style.colorScheme="dark"}else{r.style.colorScheme="light"}}catch(e){}})();`;
