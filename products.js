const PRODUCTS = [
 {
  "id": "tommy-polo",
  "brand": "Tommy Hilfiger",
  "name": "Polo piqué negro",
  "rayon": "hombre",
  "price": 42000,
  "promo": false,
  "image": "assets/products/tommy-polo.jpg"
 },
 {
  "id": "tommy-navy",
  "brand": "Tommy Hilfiger",
  "name": "Polo marino",
  "rayon": "hombre",
  "price": 45000,
  "promo": false,
  "image": "assets/products/tommy-navy.jpg"
 },
 {
  "id": "tommy-red",
  "brand": "Tommy Hilfiger",
  "name": "Polo piqué rojo",
  "rayon": "hombre",
  "price": 39000,
  "promo": true,
  "image": "assets/products/tommy-red.jpg"
 },
 {
  "id": "tommy-shoe",
  "brand": "Tommy Hilfiger",
  "name": "Zapato de piel marrón",
  "rayon": "hombre",
  "price": 85000,
  "promo": false,
  "image": "assets/products/tommy-shoe.jpg"
 },
 {
  "id": "boss-shirt",
  "brand": "Boss",
  "name": "Camisa slim blanca",
  "rayon": "hombre",
  "price": 68000,
  "promo": false,
  "image": "assets/products/boss-shirt.jpg"
 },
 {
  "id": "boss-blazer",
  "brand": "Boss",
  "name": "Americana de lana",
  "rayon": "hombre",
  "price": 145000,
  "promo": true,
  "image": "assets/products/boss-blazer.jpg"
 },
 {
  "id": "boss-tux",
  "brand": "Boss",
  "name": "Esmoquin negro",
  "rayon": "hombre",
  "price": 220000,
  "promo": false,
  "image": "assets/products/boss-tux.jpg"
 },
 {
  "id": "boss-suit",
  "brand": "Boss",
  "name": "Traje blanco",
  "rayon": "mujer",
  "price": 185000,
  "promo": false,
  "image": "assets/products/boss-suit.jpg"
 },
 {
  "id": "boss-sun",
  "brand": "Boss",
  "name": "Gafas de sol acetato",
  "rayon": "gafas",
  "price": 78000,
  "promo": false,
  "image": "assets/products/boss-sun.jpg"
 },
 {
  "id": "diesel-jeans",
  "brand": "Diesel",
  "name": "Vaquero skinny negro",
  "rayon": "hombre",
  "price": 79000,
  "promo": false,
  "image": "assets/products/diesel-jeans.jpg"
 },
 {
  "id": "diesel-jacket",
  "brand": "Diesel",
  "name": "Cazadora vaquera",
  "rayon": "hombre",
  "price": 98000,
  "promo": true,
  "image": "assets/products/diesel-jacket.jpg"
 },
 {
  "id": "diesel-look",
  "brand": "Diesel",
  "name": "Look denim",
  "rayon": "mujer",
  "price": 120000,
  "promo": false,
  "image": "assets/products/diesel-look.jpg"
 },
 {
  "id": "diesel-mujer",
  "brand": "Diesel",
  "name": "Conjunto denim",
  "rayon": "mujer",
  "price": 88000,
  "promo": false,
  "image": "assets/products/diesel-mujer.jpg"
 },
 {
  "id": "jj-jeans",
  "brand": "Jack & Jones",
  "name": "Vaquero slim azul",
  "rayon": "hombre",
  "price": 52000,
  "promo": false,
  "image": "assets/products/jj-jeans.jpg"
 },
 {
  "id": "jj-shirt",
  "brand": "Jack & Jones",
  "name": "Camisa denim",
  "rayon": "hombre",
  "price": 48000,
  "promo": true,
  "image": "assets/products/jj-shirt.jpg"
 },
 {
  "id": "jj-light",
  "brand": "Jack & Jones",
  "name": "Vaquero slim claro",
  "rayon": "hombre",
  "price": 54000,
  "promo": false,
  "image": "assets/products/jj-light.jpg"
 },
 {
  "id": "jj-tee",
  "brand": "Jack & Jones",
  "name": "Camiseta blanca",
  "rayon": "hombre",
  "price": 28000,
  "promo": false,
  "image": "assets/products/jj-tee.jpg"
 },
 {
  "id": "jj-oxford",
  "brand": "Jack & Jones",
  "name": "Camisa oxford blanca",
  "rayon": "hombre",
  "price": 46000,
  "promo": false,
  "image": "assets/products/jj-oxford.jpg"
 },
 {
  "id": "ck-tee",
  "brand": "Calvin Klein",
  "name": "Camiseta textura marino",
  "rayon": "hombre",
  "price": 32000,
  "promo": false,
  "image": "assets/products/ck-tee.jpg"
 },
 {
  "id": "ck-teal",
  "brand": "Calvin Klein",
  "name": "Polo verde",
  "rayon": "hombre",
  "price": 38000,
  "promo": false,
  "image": "assets/products/ck-teal.jpg"
 },
 {
  "id": "ck-black",
  "brand": "Calvin Klein",
  "name": "Polo negro",
  "rayon": "hombre",
  "price": 42000,
  "promo": true,
  "image": "assets/products/ck-black.jpg"
 },
 {
  "id": "ck-zip",
  "brand": "Calvin Klein",
  "name": "Polo cremallera",
  "rayon": "hombre",
  "price": 48000,
  "promo": false,
  "image": "assets/products/ck-zip.jpg"
 },
 {
  "id": "ea7-suit",
  "brand": "EA7",
  "name": "Chándal negro",
  "rayon": "hombre",
  "price": 95000,
  "promo": true,
  "image": "assets/products/ea7-suit.jpg"
 },
 {
  "id": "ea7-mujer",
  "brand": "EA7",
  "name": "Top deportivo negro",
  "rayon": "mujer",
  "price": 45000,
  "promo": false,
  "image": "assets/products/ea7-mujer.jpg"
 },
 {
  "id": "ea7-polo",
  "brand": "EA7",
  "name": "Polo negro",
  "rayon": "hombre",
  "price": 55000,
  "promo": false,
  "image": "assets/products/ea7-polo.jpg"
 },
 {
  "id": "ea7-zip",
  "brand": "EA7",
  "name": "Chaqueta de chándal",
  "rayon": "hombre",
  "price": 89000,
  "promo": false,
  "image": "assets/products/ea7-zip.jpg"
 },
 {
  "id": "aldo-sneaker",
  "brand": "Aldo",
  "name": "Zapatilla de piel negra",
  "rayon": "hombre",
  "price": 75000,
  "promo": false,
  "image": "assets/products/aldo-sneaker.jpg"
 },
 {
  "id": "aldo-loafer",
  "brand": "Aldo",
  "name": "Mocasín negro",
  "rayon": "hombre",
  "price": 72000,
  "promo": false,
  "image": "assets/products/aldo-loafer.jpg"
 },
 {
  "id": "aldo-cognac",
  "brand": "Aldo",
  "name": "Mocasín coñac",
  "rayon": "hombre",
  "price": 78000,
  "promo": true,
  "image": "assets/products/aldo-cognac.jpg"
 },
 {
  "id": "guess-bag",
  "brand": "Guess",
  "name": "Bolso Mooney negro",
  "rayon": "mujer",
  "price": 115000,
  "promo": true,
  "image": "assets/products/guess-bag.jpg"
 },
 {
  "id": "guess-grey",
  "brand": "Guess",
  "name": "Zapatilla gris",
  "rayon": "mujer",
  "price": 89000,
  "promo": false,
  "image": "assets/products/guess-grey.jpg"
 },
 {
  "id": "guess-platform",
  "brand": "Guess",
  "name": "Zapatilla plataforma negra",
  "rayon": "mujer",
  "price": 95000,
  "promo": false,
  "image": "assets/products/guess-platform.jpg"
 },
 {
  "id": "guess-white",
  "brand": "Guess",
  "name": "Zapatilla blanca",
  "rayon": "mujer",
  "price": 92000,
  "promo": false,
  "image": "assets/products/guess-white.jpg"
 },
 {
  "id": "guess-sun",
  "brand": "Guess",
  "name": "Gafas de sol GU7861",
  "rayon": "gafas",
  "price": 72000,
  "promo": false,
  "image": "assets/products/guess-sun.jpg"
 },
 {
  "id": "moschino-bag",
  "brand": "Love Moschino",
  "name": "Bolso acolchado negro",
  "rayon": "mujer",
  "price": 98000,
  "promo": true,
  "image": "assets/products/moschino-bag.jpg"
 },
 {
  "id": "mosc-heart",
  "brand": "Love Moschino",
  "name": "Bolso corazón negro",
  "rayon": "mujer",
  "price": 89000,
  "promo": false,
  "image": "assets/products/mosc-heart.jpg"
 },
 {
  "id": "mosc-chain",
  "brand": "Love Moschino",
  "name": "Bolso corazón cadena",
  "rayon": "mujer",
  "price": 94000,
  "promo": false,
  "image": "assets/products/mosc-chain.jpg"
 },
 {
  "id": "mosc-pink",
  "brand": "Love Moschino",
  "name": "Bolso corazón rosa",
  "rayon": "mujer",
  "price": 86000,
  "promo": false,
  "image": "assets/products/mosc-pink.jpg"
 },
 {
  "id": "mosc-shoulder",
  "brand": "Love Moschino",
  "name": "Bolso de hombro negro",
  "rayon": "mujer",
  "price": 92000,
  "promo": false,
  "image": "assets/products/mosc-shoulder.jpg"
 },
 {
  "id": "festina-chrono",
  "brand": "Festina",
  "name": "Cronógrafo azul",
  "rayon": "relojes",
  "price": 145000,
  "promo": false,
  "image": "assets/products/festina-chrono.jpg"
 },
 {
  "id": "fest-green",
  "brand": "Festina",
  "name": "Cronógrafo verde",
  "rayon": "relojes",
  "price": 155000,
  "promo": true,
  "image": "assets/products/fest-green.jpg"
 },
 {
  "id": "fest-white",
  "brand": "Festina",
  "name": "Cronógrafo Racing blanco",
  "rayon": "relojes",
  "price": 168000,
  "promo": false,
  "image": "assets/products/fest-white.jpg"
 },
 {
  "id": "fest-black",
  "brand": "Festina",
  "name": "Cronógrafo Racing negro",
  "rayon": "relojes",
  "price": 168000,
  "promo": false,
  "image": "assets/products/fest-black.jpg"
 },
 {
  "id": "fest-gold",
  "brand": "Festina",
  "name": "Cronógrafo Racing dorado",
  "rayon": "relojes",
  "price": 175000,
  "promo": false,
  "image": "assets/products/fest-gold.jpg"
 },
 {
  "id": "fest-classic",
  "brand": "Festina",
  "name": "Cronógrafo esfera blanca",
  "rayon": "relojes",
  "price": 132000,
  "promo": false,
  "image": "assets/products/fest-classic.jpg"
 },
 {
  "id": "fossil-blue",
  "brand": "Fossil",
  "name": "Reloj acero Blue",
  "rayon": "relojes",
  "price": 89000,
  "promo": false,
  "image": "assets/products/fossil-blue.jpg"
 },
 {
  "id": "fossil-grey",
  "brand": "Fossil",
  "name": "Cronógrafo gris",
  "rayon": "relojes",
  "price": 95000,
  "promo": true,
  "image": "assets/products/fossil-grey.jpg"
 },
 {
  "id": "fossil-black",
  "brand": "Fossil",
  "name": "Cronógrafo negro",
  "rayon": "relojes",
  "price": 98000,
  "promo": false,
  "image": "assets/products/fossil-black.jpg"
 },
 {
  "id": "mk-chain",
  "brand": "Michael Kors",
  "name": "Cronógrafo dorado cadena",
  "rayon": "relojes",
  "price": 185000,
  "promo": false,
  "image": "assets/products/mk-chain.jpg"
 },
 {
  "id": "mk-ritz",
  "brand": "Michael Kors",
  "name": "Cronógrafo dorado Ritz",
  "rayon": "relojes",
  "price": 210000,
  "promo": false,
  "image": "assets/products/mk-ritz.jpg"
 },
 {
  "id": "mk-gold",
  "brand": "Michael Kors",
  "name": "Cronógrafo dorado",
  "rayon": "relojes",
  "price": 195000,
  "promo": true,
  "image": "assets/products/mk-gold.jpg"
 },
 {
  "id": "mk-link",
  "brand": "Michael Kors",
  "name": "Cronógrafo brazalete",
  "rayon": "relojes",
  "price": 198000,
  "promo": false,
  "image": "assets/products/mk-link.jpg"
 },
 {
  "id": "mk-case",
  "brand": "Michael Kors",
  "name": "Cronógrafo caja dorada",
  "rayon": "relojes",
  "price": 188000,
  "promo": false,
  "image": "assets/products/mk-case.jpg"
 },
 {
  "id": "lambo",
  "brand": "Lamborghini",
  "name": "Cronógrafo Spyder",
  "rayon": "relojes",
  "price": 245000,
  "promo": true,
  "image": "assets/products/lambo.jpg"
 },
 {
  "id": "gant",
  "brand": "Gant",
  "name": "Cronógrafo acero",
  "rayon": "relojes",
  "price": 125000,
  "promo": true,
  "image": "assets/products/gant.jpg"
 },
 {
  "id": "tous-bear",
  "brand": "Tous",
  "name": "Pulsera oso de plata",
  "rayon": "joyas",
  "price": 72000,
  "promo": true,
  "image": "assets/products/tous-bear.jpg"
 },
 {
  "id": "majorica-pearls",
  "brand": "Majorica",
  "name": "Collar de perlas",
  "rayon": "joyas",
  "price": 86000,
  "promo": true,
  "image": "assets/products/majorica-pearls.jpg"
 },
 {
  "id": "maj-white",
  "brand": "Majorica",
  "name": "Collar de perlas blanco",
  "rayon": "joyas",
  "price": 92000,
  "promo": false,
  "image": "assets/products/maj-white.jpg"
 },
 {
  "id": "maj-pendant",
  "brand": "Majorica",
  "name": "Colgante de perla",
  "rayon": "joyas",
  "price": 64000,
  "promo": false,
  "image": "assets/products/maj-pendant.jpg"
 },
 {
  "id": "police-sun",
  "brand": "Police",
  "name": "Gafas de sol SPLN37M",
  "rayon": "gafas",
  "price": 65000,
  "promo": false,
  "image": "assets/products/police-sun.jpg"
 },
 {
  "id": "pol-shield",
  "brand": "Police",
  "name": "Gafas escudo",
  "rayon": "gafas",
  "price": 68000,
  "promo": true,
  "image": "assets/products/pol-shield.jpg"
 },
 {
  "id": "pol-aviator",
  "brand": "Police",
  "name": "Aviador",
  "rayon": "gafas",
  "price": 62000,
  "promo": false,
  "image": "assets/products/pol-aviator.jpg"
 },
 {
  "id": "samsonite-carry",
  "brand": "Samsonite",
  "name": "Maleta cabina negra",
  "rayon": "maletas",
  "price": 165000,
  "promo": false,
  "image": "assets/products/samsonite-carry.jpg"
 },
 {
  "id": "samsonite-winfield",
  "brand": "Samsonite",
  "name": "Maleta Winfield cabina",
  "rayon": "maletas",
  "price": 189000,
  "promo": false,
  "image": "assets/products/samsonite-winfield.jpg"
 },
 {
  "id": "sam-plum",
  "brand": "Samsonite",
  "name": "Maleta cabina ciruela",
  "rayon": "maletas",
  "price": 175000,
  "promo": true,
  "image": "assets/products/sam-plum.jpg"
 },
 {
  "id": "sam-red",
  "brand": "Samsonite",
  "name": "Maleta Winfield roja",
  "rayon": "maletas",
  "price": 198000,
  "promo": false,
  "image": "assets/products/sam-red.jpg"
 },
 {
  "id": "sam-black",
  "brand": "Samsonite",
  "name": "Maleta Winfield negra",
  "rayon": "maletas",
  "price": 198000,
  "promo": false,
  "image": "assets/products/sam-black.jpg"
 },
 {
  "id": "sam-blue",
  "brand": "Samsonite",
  "name": "Maleta Winfield azul",
  "rayon": "maletas",
  "price": 198000,
  "promo": false,
  "image": "assets/products/sam-blue.jpg"
 },
 {
  "id": "sam-soft",
  "brand": "Samsonite",
  "name": "Neceser morado",
  "rayon": "maletas",
  "price": 45000,
  "promo": false,
  "image": "assets/products/sam-soft.jpg"
 }
];
