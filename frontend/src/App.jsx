import { useEffect, useState } from 'react'
import Map from './components/Map';
import Dropdown from './components/Dropdown';

function App() {
  const [hover, setHover] = useState(false);
  const [mode, setMode] = useState("visualization");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "auto"
  );

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className='flex flex-col h-screen font-subway'>
      <header className="flex justify-between items-center h-14 w-full bg-stone-950 text-white font-subway font-semibold border-b border-neutral-600 z-1003">
        <div className='w-1/3'>
            <a href="/" className="flex justify-start items-center w-max" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
              <div className={`flex justify-center items-center text-xl`}>
                  <div className='w-3 h-12 bg-stone-950 z-1'></div>
                  <span className="flex justify-center items-center bg-blue text-white h-7.5 w-7.5 rounded-full z-2 -ml-1">K</span>
                  <span className={`text-xl transition-all duration-400 text-transparent -translate-x-full font-subway ${hover && "sm:translate-x-0 sm:text-white"}`}>nicks in&nbsp;</span>
                  <span className={`flex justify-center items-center bg-orange text-white h-7.5 w-7.5 rounded-full z-1 transition-all duration-400 -ml-22.5 ${hover && "sm:ml-0"}`}>M</span>
                  <span className={`text-xl transition-all duration-400 mr-1.5 text-transparent -translate-x-full font-subway ${hover && "sm:translate-x-0 sm:text-white"}`}>otion</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="10 20 25 40" className={`w-4 h-8 fill-current transition-all duration-400 -ml-12 ${hover && "sm:ml-0"}`}>
                  <path d="M25.336 20.293c-1.632 0-2.963 1.331-2.963 2.962 0 1.633 1.331 2.965 2.963 2.965 1.632 0 2.963-1.332 2.963-2.965 0-1.333-1.331-2.662-2.963-2.662"/>
                  <path d="M34.308 38.975l-6.216-4.142c-.288-1.215-1.478-6.605-3.869-7.854-2.369-1.568-11.1 4.865-11.15 4.918v9.383l1.893-.33.741-7.489c.713-.142 1.426-.287 2.139-.429-1.558 4.029-2.131 7.912-1.234 10.472l-3.786 15.472 2.551 1.811 5.515-14.32 2.551 2.716 3.54 10.782 3.374-1.234-3.045-11.359-3.539-6.336 1.355-4.678 1.443 1.879 6.749 2.223 2.011-1.512z"/>
              </svg>
          </a>
        </div>
        <nav className='hidden sm:flex w-1/3 justify-center items-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-32 text-sm md:text-base lg:text-lg xl:text-xl font-econ tracking-wider uppercase'>
          <button onClick={()=>setMode("visualization")} className={`w-1/3 text-center cursor-pointer box-border ${mode === "visualization" && "border-b-2"}`}>Visualization</button>
          <button onClick={()=>setMode("analysis")} className={`w-1/3 text-center cursor-pointer box-border ${mode === "analysis" && "border-b-2"}`}>Analysis</button>
          <button onClick={()=>setMode("about")} className={`w-1/3 text-center cursor-pointer box-border ${mode === "about" && "border-b-2"}`}>Methodology</button>
        </nav>
        <div className="hidden sm:flex w-1/3 justify-end items-center">
            <Dropdown theme={theme} setTheme={setTheme}/>
        </div>
        <div className="flex sm:hidden w-1/3 justify-end items-center mr-2">
            <button className='cursor-pointer' onClick={()=>setMobileNavOpen(!mobileNavOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                {!mobileNavOpen ? <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                : <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>}
              </svg>
            </button>
            <div className={`fixed z-1000 right-0 top-14 py-8 pl-3 w-full h-[calc(100vh-56px)] bg-white dark:bg-black box-border border-current/20 transition-all duration-250 ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}>
              {/* <div className='flex justify-end items-center text-black dark:text-white'>
                <Dropdown theme={theme} setTheme={setTheme}/>
              </div> */}
              <nav className='flex flex-col justify-center items-center gap-8 text-xl'>
                <button onClick={()=>{setMode("visualization"); setMobileNavOpen(false);}} className={`text-center cursor-pointer box-border ${mode === "visualization" && "border-b-2"}`}>Visualization</button>
                <button onClick={()=>{setMode("analysis"); setMobileNavOpen(false);}} className={`text-center cursor-pointer box-border ${mode === "analysis" && "border-b-2"}`}>Analysis</button>
                <button onClick={()=>{setMode("about"); setMobileNavOpen(false);}} className={`text-center cursor-pointer box-border ${mode === "about" && "border-b-2"}`}>Methodology</button>
              </nav>
            </div>
        </div>
      </header>

      <Map 
        theme={theme}
        mode={mode}
        setMode={setMode}
      />
    </div>
  )
}

export default App
