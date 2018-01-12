library(REmap)
library(maps)  
library(mapdata)  
library(maptools) 
library(rgeos)
setwd('..//Nodejs//map')

options(remap.js.web=T)
data <- read.csv(file="heat.csv",header=T)
html <- remapH(data,
       maptype = 'china',
       theme = get_theme("dark"),
       blurSize = 150,
       color = "blue",
       minAlpha = 10,
       opacity = 1,
       )
plot(html) 