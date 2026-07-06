import React, { useState } from "react";
import { ShoppingBag, ExternalLink, Book, Image as ImageIcon, Search, ChevronRight } from "lucide-react";

type Category = "mangas" | "produits dérivés";

interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  link: string;
  category: Category;
  price?: string;
}

const PRODUCTS: Product[] = [
  // Nouveautés
  { id: "m_new_1", name: "One Piece Édition Originale - Tome 114", category: "mangas", link: "https://amzn.to/4vjdmcv", image: "https://m.media-amazon.com/images/P/234407113X.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },
  { id: "m_new_2", name: "One Piece Édition Originale - Tome 113", category: "mangas", link: "https://amzn.to/3SIrZs9", image: "https://m.media-amazon.com/images/P/2344071121.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },
  { id: "m_new_3", name: "One Piece Édition Originale - Tome 109", category: "mangas", link: "https://amzn.to/4viYgDM", image: "https://m.media-amazon.com/images/P/2344068929.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },

  // Mangas (Coffrets)
  { id: "c1", name: "Coffret 1 : East Blue (Tomes 1 à 12)", category: "mangas", link: "https://amzn.to/3RfOF2v", image: "https://m.media-amazon.com/images/P/2344050124.01._SCLZZZZZZZ_.jpg" },
  { id: "c2", name: "Coffret 2 : Alabasta (Tomes 13 à 23)", category: "mangas", link: "https://amzn.to/4bmQamd", image: "https://m.media-amazon.com/images/P/2344052003.01._SCLZZZZZZZ_.jpg" },
  { id: "c3", name: "Coffret 3 : Skypiea (Tomes 24 à 32)", category: "mangas", link: "https://amzn.to/3SvNBrL", image: "https://m.media-amazon.com/images/P/2344055436.01._SCLZZZZZZZ_.jpg" },
  { id: "c4", name: "Coffret 4 : Water Seven (Tomes 33 à 45)", category: "mangas", link: "https://amzn.to/4p1gwA1", image: "https://m.media-amazon.com/images/P/2344057838.01._SCLZZZZZZZ_.jpg" },
  { id: "c5", name: "Coffret 5 : Thriller Bark (Tomes 46 à 53)", category: "mangas", link: "https://amzn.to/4gCyMh5", image: "https://m.media-amazon.com/images/P/2344058346.01._SCLZZZZZZZ_.jpg" },
  { id: "c6", name: "Coffret 6 : Guerre au Sommet (Tomes 54 à 61)", category: "mangas", link: "https://amzn.to/4fhQLbe", image: "https://m.media-amazon.com/images/P/2344062688.01._SCLZZZZZZZ_.jpg" },
  { id: "c7", name: "Coffret 7 : Hommes-Poissons (Tomes 62 à 70)", category: "mangas", link: "https://amzn.to/4y3Rrs7", image: "https://m.media-amazon.com/images/P/2344062696.01._SCLZZZZZZZ_.jpg" },
  { id: "c8", name: "Coffret 8 : Dressrosa (Tomes 71 à 80)", category: "mangas", link: "https://amzn.to/4eEbwOc", image: "https://m.media-amazon.com/images/P/2344068880.01._SCLZZZZZZZ_.jpg" },
  { id: "c9", name: "Coffret 9 : Quatre Empereurs (Tomes 81 à 90)", category: "mangas", link: "https://amzn.to/4vEg9Oc", image: "https://m.media-amazon.com/images/P/2344068899.01._SCLZZZZZZZ_.jpg" },
  { id: "c10", name: "Coffret 10 : Pays des Wa (Tomes 91 à 104)", category: "mangas", link: "https://amzn.to/3SHqQRF", image: "https://m.media-amazon.com/images/P/2344074279.01._SCLZZZZZZZ_.jpg" },
  { id: "m_encyclopedie", name: "Fruits Démon Encyclopédie Kamalthero", category: "mangas", link: "https://amzn.to/4y2Q64W", image: "https://m.media-amazon.com/images/P/2376976006.01._SCLZZZZZZZ_.jpg" },
  { id: "m_11", name: "One Piece Épisode A", category: "mangas", link: "https://amzn.to/4eIFCjJ", image: "https://m.media-amazon.com/images/P/2344057188.01._SCLZZZZZZZ_.jpg" },
  { id: "m_12", name: "One Piece Épisode A - Tome 2", category: "mangas", link: "https://amzn.to/4gRxC10", image: "https://m.media-amazon.com/images/P/2344057196.01._SCLZZZZZZZ_.jpg" },
  { id: "m_13", name: "One Piece Tome 1 Édition Collector", category: "mangas", link: "https://amzn.to/4p1gjMY", image: "https://m.media-amazon.com/images/P/2344048758.01._SCLZZZZZZZ_.jpg" },
  { id: "m_14", name: "One Piece Tome 100 Édition Collector", category: "mangas", link: "https://amzn.to/4wsNpIu", image: "https://m.media-amazon.com/images/I/51wUVo4HT6S.jpg" },
  { id: "m_15", name: "One Piece Blue : Grand Data File", category: "mangas", link: "https://amzn.to/4eR5mck", image: "https://m.media-amazon.com/images/P/2723495639.01._SCLZZZZZZZ_.jpg" },
  { id: "m_16", name: "One Piece Green : Secret Pieces", category: "mangas", link: "https://amzn.to/4fhaSq1", image: "https://m.media-amazon.com/images/P/272348730X.01._SCLZZZZZZZ_.jpg" },
  { id: "m_17", name: "One Piece Yellow : Grand Elements", category: "mangas", link: "https://amzn.to/3ReaWxG", image: "https://m.media-amazon.com/images/P/2723450252.01._SCLZZZZZZZ_.jpg" },
  { id: "m_new_y1", name: "One Piece - Yellow", category: "mangas", link: "https://amzn.to/4vlc00U", image: "https://m.media-amazon.com/images/I/81WuOeKZppL._SL1500_.jpg" },
  { id: "m_new_y2", name: "Wanted", category: "mangas", link: "https://amzn.to/4fie2d2", image: "https://m.media-amazon.com/images/I/61Un+8AweaL.jpg" },
  { id: "m_18", name: "One Piece Red : Grand Characters", category: "mangas", link: "https://amzn.to/4vfpc7t", image: "https://m.media-amazon.com/images/P/2344027602.01._SCLZZZZZZZ_.jpg" },
  { id: "m_19", name: "One Piece Blue Deep : Characters World", category: "mangas", link: "https://amzn.to/44IhNm5", image: "https://m.media-amazon.com/images/P/2344027610.01._SCLZZZZZZZ_.jpg" },
  { id: "m_20", name: "One Piece Party - Tome 1", category: "mangas", link: "https://amzn.to/4f1UEA1", image: "https://m.media-amazon.com/images/P/2344028269.01._SCLZZZZZZZ_.jpg" },
  { id: "m_21", name: "One Piece Party - Tome 2", category: "mangas", link: "https://amzn.to/4wnWdir", image: "https://m.media-amazon.com/images/P/2344037217.01._SCLZZZZZZZ_.jpg" },
  { id: "m_22", name: "One Piece Party - Tome 3", category: "mangas", link: "https://amzn.to/4ge9Fkm", image: "https://m.media-amazon.com/images/P/2344040404.01._SCLZZZZZZZ_.jpg" },
  { id: "m_23", name: "One Piece Party - Tome 4", category: "mangas", link: "https://amzn.to/4oYiFMF", image: "https://m.media-amazon.com/images/P/2344040412.01._SCLZZZZZZZ_.jpg" },
  { id: "m_24", name: "One Piece Party - Tome 5", category: "mangas", link: "https://amzn.to/3SCa5Y5", image: "https://m.media-amazon.com/images/P/2344041621.01._SCLZZZZZZZ_.jpg" },
  { id: "m_25", name: "One Piece Party - Tome 6", category: "mangas", link: "https://amzn.to/3SZdUqd", image: "https://m.media-amazon.com/images/P/2344043314.01._SCLZZZZZZZ_.jpg" },
  { id: "m_26", name: "One Piece Magazine - Tome 1", category: "mangas", link: "https://amzn.to/4p6dTwW", image: "https://m.media-amazon.com/images/P/2344049037.01._SCLZZZZZZZ_.jpg" },
  { id: "m_27", name: "One Piece Magazine - Tome 2", category: "mangas", link: "https://amzn.to/4eVDp3b", image: "https://m.media-amazon.com/images/P/2344051953.01._SCLZZZZZZZ_.jpg" },
  { id: "m_28", name: "One Piece Magazine - Tome 3", category: "mangas", link: "https://amzn.to/4ges9kJ", image: "https://m.media-amazon.com/images/P/2344052895.01._SCLZZZZZZZ_.jpg" },
  { id: "m_29", name: "One Piece Magazine - Tome 4", category: "mangas", link: "https://amzn.to/4eRgHsR", image: "https://m.media-amazon.com/images/P/2344053018.01._SCLZZZZZZZ_.jpg" },
  { id: "m_30", name: "One Piece Magazine - Tome 5", category: "mangas", link: "https://amzn.to/4gkldT7", image: "https://m.media-amazon.com/images/P/2344055843.01._SCLZZZZZZZ_.jpg" },
  { id: "m_31", name: "One Piece Magazine - Tome 6", category: "mangas", link: "https://amzn.to/3QU5dNe", image: "https://m.media-amazon.com/images/P/2344055851.01._SCLZZZZZZZ_.jpg" },
  { id: "m_32", name: "One Piece Magazine - Tome 7", category: "mangas", link: "https://amzn.to/4gk9K6a", image: "https://m.media-amazon.com/images/P/2344062661.01._SCLZZZZZZZ_.jpg" },
  { id: "m_33", name: "One Piece Vivre Card - Starter Set Vol. 1", category: "mangas", link: "https://amzn.to/4eMP6ZK", image: "https://m.media-amazon.com/images/P/2344071164.01._SCLZZZZZZZ_.jpg" },
  { id: "m_34", name: "One Piece Vivre Card - Booster Pack 1", category: "mangas", link: "https://amzn.to/3QB3HQh", image: "https://m.media-amazon.com/images/P/2344071172.01._SCLZZZZZZZ_.jpg" },
  { id: "m_35", name: "One Piece Vivre Card - Booster Pack 2", category: "mangas", link: "https://amzn.to/4gk8lMO", image: "https://m.media-amazon.com/images/P/2344071180.01._SCLZZZZZZZ_.jpg" },
  { id: "m_36", name: "One Piece Vivre Card - Booster Pack 3", category: "mangas", link: "https://amzn.to/4vfadua", image: "https://m.media-amazon.com/images/P/2344071199.01._SCLZZZZZZZ_.jpg" },
  { id: "m_37", name: "One Piece Vivre Card - Booster Pack 4", category: "mangas", link: "https://amzn.to/4vJet65", image: "https://m.media-amazon.com/images/P/2344071202.01._SCLZZZZZZZ_.jpg" },
  { id: "m_38", name: "One Piece Vivre Card - Booster Pack 5", category: "mangas", link: "https://amzn.to/4wo7sYm", image: "https://m.media-amazon.com/images/P/2344071210.01._SCLZZZZZZZ_.jpg" },
  { id: "m_39", name: "One Piece Vivre Card - Booster Pack 6", category: "mangas", link: "https://amzn.to/4b4hXru", image: "https://m.media-amazon.com/images/P/2344071229.01._SCLZZZZZZZ_.jpg" },
  { id: "m_40", name: "One Piece Vivre Card - Booster Pack 7", category: "mangas", link: "https://amzn.to/44Kemv8", image: "https://m.media-amazon.com/images/P/2344071237.01._SCLZZZZZZZ_.jpg" },
  { id: "m_41", name: "One Piece Vivre Card - Booster Pack 8", category: "mangas", link: "https://amzn.to/44EVWvQ", image: "https://m.media-amazon.com/images/P/2344071245.01._SCLZZZZZZZ_.jpg" },
  { id: "m_42", name: "One Piece Vivre Card - Booster Pack 9", category: "mangas", link: "https://amzn.to/44HPW5p", image: "https://m.media-amazon.com/images/P/2344071253.01._SCLZZZZZZZ_.jpg" },
  { id: "m_43", name: "One Piece Vivre Card - Booster Pack 10", category: "mangas", link: "https://amzn.to/44a2FxK", image: "https://m.media-amazon.com/images/P/2344071261.01._SCLZZZZZZZ_.jpg" },
  
  // Produit dérivés & Goodies
  { id: "f_new_1", name: "SAKAMI Pendentif Porte-clés", category: "produits dérivés", link: "https://amzn.to/4axHSHU", image: "https://m.media-amazon.com/images/I/51baGK6jn-L._AC_SL1000_.jpg" },
  { id: "f_1", name: "Peluche One Piece Tony Chopper", category: "produits dérivés", link: "https://amzn.to/3QQGDgq", image: "https://m.media-amazon.com/images/P/B07QC85Y41.01._SCLZZZZZZZ_.jpg" },
  { id: "f_2", name: "Peluche One Piece Tony Chopper", category: "produits dérivés", link: "https://amzn.to/4wpdXtX", image: "https://m.media-amazon.com/images/P/B0842CBRWZ.01._SCLZZZZZZZ_.jpg" },
  { id: "f_3", name: "Figurine One Piece Sanji", category: "produits dérivés", link: "https://amzn.to/4bi6AMD", image: "https://m.media-amazon.com/images/P/B07QB8DKQT.01._SCLZZZZZZZ_.jpg" },
  { id: "f_4", name: "Figurine One Piece Zoro", category: "produits dérivés", link: "https://amzn.to/3QDTxyi", image: "https://m.media-amazon.com/images/P/B084YS3KCH.01._SCLZZZZZZZ_.jpg" },
  { id: "f_5", name: "Peluche One Piece Tony Chopper", category: "produits dérivés", link: "https://amzn.to/4wps1nj", image: "https://m.media-amazon.com/images/P/B07QC85Y41.01._SCLZZZZZZZ_.jpg" },
  { id: "f_6", name: "Peluche One Piece Trafalgar Law", category: "produits dérivés", link: "https://amzn.to/4p0jmVZ", image: "https://m.media-amazon.com/images/P/B07TJZYJCH.01._SCLZZZZZZZ_.jpg" },
  { id: "f_7", name: "Peluche One Piece Zoro", category: "produits dérivés", link: "https://amzn.to/4y9yvIL", image: "https://m.media-amazon.com/images/P/B09S4CSV1R.01._SCLZZZZZZZ_.jpg" },
  { id: "f_8", name: "Peluche One Piece Luffy", category: "produits dérivés", link: "https://amzn.to/4f1TEvL", image: "https://m.media-amazon.com/images/P/B07Z75QZMG.01._SCLZZZZZZZ_.jpg" },
  { id: "f_9", name: "Peluche Fruit du Démon Gomu Gomu no Mi", category: "produits dérivés", link: "https://amzn.to/4vCNglw", image: "https://m.media-amazon.com/images/P/B0D1VSV5RJ.01._SCLZZZZZZZ_.jpg" },
  { id: "f_11", name: "Lampe Fruit du Démon", category: "produits dérivés", link: "https://amzn.to/4p5vR2v", image: "https://m.media-amazon.com/images/P/B0F3D8H84L.01._SCLZZZZZZZ_.jpg" },
  { id: "f_12", name: "Veilleuse Décoration Chambre", category: "produits dérivés", link: "https://amzn.to/4vCNLfo", image: "https://m.media-amazon.com/images/P/B0GSZSC1G7.01._SCLZZZZZZZ_.jpg" },
  { id: "f_13", name: "Tirelire Pyro-Fruit", category: "produits dérivés", link: "https://amzn.to/4p0Ctix", image: "https://m.media-amazon.com/images/P/B0CW9ZR8W9.01._SCLZZZZZZZ_.jpg" },
  { id: "f_14", name: "Tirelire Pyro-Fruit", category: "produits dérivés", link: "https://amzn.to/4gklKEI", image: "https://m.media-amazon.com/images/P/B0CW9ZR8W9.01._SCLZZZZZZZ_.jpg" },
  { id: "f_15", name: "Tirelire Ope Ope no Mi", category: "produits dérivés", link: "https://amzn.to/4gfi5rG", image: "https://m.media-amazon.com/images/P/B0DQYRC8YX.01._SCLZZZZZZZ_.jpg" },
  { id: "f_16", name: "Veilleuse Décoration", category: "produits dérivés", link: "https://amzn.to/4eTE1pY", image: "https://m.media-amazon.com/images/P/B0GSZFVTCH.01._SCLZZZZZZZ_.jpg" },
  { id: "f_17", name: "Tirelire Escargophone", category: "produits dérivés", link: "https://amzn.to/4aAD2d0", image: "https://m.media-amazon.com/images/P/B0CW9ZYWM6.01._SCLZZZZZZZ_.jpg" },
  { id: "f_18", name: "Tirelire Escargophone", category: "produits dérivés", link: "https://amzn.to/4f1TIvv", image: "https://m.media-amazon.com/images/P/B0DQYRJKM5.01._SCLZZZZZZZ_.jpg" },
  { id: "f_19", name: "Chope Escargophone", category: "produits dérivés", link: "https://amzn.to/4f17het", image: "https://m.media-amazon.com/images/P/B0FX3CFXVW.01._SCLZZZZZZZ_.jpg" },
  { id: "f_20", name: "Tirelire Escargophone Doflamingo", category: "produits dérivés", link: "https://amzn.to/4vFUOUz", image: "https://m.media-amazon.com/images/P/B0DQYQM854.01._SCLZZZZZZZ_.jpg" },
  { id: "f_21", name: "Tirelire Escargophone Thousand Sunny", category: "produits dérivés", link: "https://amzn.to/4v6Gnrx", image: "https://m.media-amazon.com/images/P/B0DQYQVNKB.01._SCLZZZZZZZ_.jpg" },
  { id: "f_22", name: "Tirelire Escargophone Zoro", category: "produits dérivés", link: "https://amzn.to/4gQVfXx", image: "https://m.media-amazon.com/images/P/B0DKTSFX6Q.01._SCLZZZZZZZ_.jpg" },
  { id: "f_23", name: "Funko Pop Tony Chopper", category: "produits dérivés", link: "https://amzn.to/4eVDcNw", image: "https://m.media-amazon.com/images/P/B0DYJZMR3D.01._SCLZZZZZZZ_.jpg" },
  { id: "f_24", name: "Funko Pop Monkey D. Luffy", category: "produits dérivés", link: "https://amzn.to/3TeLR6e", image: "https://m.media-amazon.com/images/P/B0CVNM5L6F.01._SCLZZZZZZZ_.jpg" },
  { id: "f_25", name: "Figurine Anime Heroes Luffy Gear 5", category: "produits dérivés", link: "https://amzn.to/44OmlqZ", image: "https://m.media-amazon.com/images/P/B0F44CHHR6.01._SCLZZZZZZZ_.jpg" },
  { id: "f_26", name: "Funko Pop Nami", category: "produits dérivés", link: "https://amzn.to/44J6ES0", image: "https://m.media-amazon.com/images/P/B0CVNN3VY1.01._SCLZZZZZZZ_.jpg" },
  { id: "f_27", name: "Funko Pop Roronoa Zoro", category: "produits dérivés", link: "https://amzn.to/44KsG6Q", image: "https://m.media-amazon.com/images/P/B08FMSC7NC.01._SCLZZZZZZZ_.jpg" },
  { id: "f_28", name: "Funko Pop Monkey D. Luffy", category: "produits dérivés", link: "https://amzn.to/4eTE7Om", image: "https://m.media-amazon.com/images/P/B0CDJQT8XJ.01._SCLZZZZZZZ_.jpg" },
  { id: "f_29", name: "Funko Pop Roronoa Zoro", category: "produits dérivés", link: "https://amzn.to/4vgL3v7", image: "https://m.media-amazon.com/images/P/B0CVNLPB83.01._SCLZZZZZZZ_.jpg" },
  { id: "f_30", name: "Funko Pop Sanji", category: "produits dérivés", link: "https://amzn.to/3SGCdJA", image: "https://m.media-amazon.com/images/P/B0CVNXJQ6Z.01._SCLZZZZZZZ_.jpg" },
  { id: "f_31", name: "Funko Pop Jumbo Kaido Dragon", category: "produits dérivés", link: "https://amzn.to/4gf8MYP", image: "https://m.media-amazon.com/images/P/B0B6GCZPKX.01._SCLZZZZZZZ_.jpg" },
  { id: "f_32", name: "LEGO One Piece", category: "produits dérivés", link: "https://amzn.to/3SWC9p2", image: "https://m.media-amazon.com/images/P/B0DWDR21CF.01._SCLZZZZZZZ_.jpg" },
  { id: "f_33", name: "Funko Pop Animation", category: "produits dérivés", link: "https://amzn.to/4vU3UNF", image: "https://m.media-amazon.com/images/P/B0DZXSZ51T.01._SCLZZZZZZZ_.jpg" },
  { id: "f_34", name: "Funko Pop Portgas D. Ace", category: "produits dérivés", link: "https://amzn.to/3QVcexh", image: "https://m.media-amazon.com/images/P/B0198KU8PY.01._SCLZZZZZZZ_.jpg" },
  { id: "f_35", name: "Funko Pop Katakuri", category: "produits dérivés", link: "https://amzn.to/4vEiUPy", image: "https://m.media-amazon.com/images/P/B0CDJDCSDH.01._SCLZZZZZZZ_.jpg" },
  { id: "f_36", name: "Funko Pop", category: "produits dérivés", link: "https://amzn.to/4eR4Jzu", image: "https://m.media-amazon.com/images/P/B0G36FKGH6.01._SCLZZZZZZZ_.jpg" },
   { id: "f_new_2", name: "Funko Pop Jumbo St. Jaygarcia Saturn", category: "produits dérivés", link: "https://amzn.to/4y17QxF", image: "https://m.media-amazon.com/images/I/71xfe0z2i7L._AC_SL1300_.jpg" },
  { id: "f_new_3", name: "Funko Pop Animation Exclusivité", category: "produits dérivés", link: "https://amzn.to/3QDZtax", image: "https://m.media-amazon.com/images/I/71l2M26r2rL._AC_SL1300_.jpg" },
  { id: "f_new_4", name: "Funko Pop Jewelry Bonney", category: "produits dérivés", link: "https://amzn.to/4fcYPKp", image: "https://m.media-amazon.com/images/I/71r67VsKLSL._AC_SL1300_.jpg" },
  { id: "f_new_5", name: "Funko Pop Animation authentification", category: "produits dérivés", link: "https://amzn.to/4gTXTvG", image: "https://m.media-amazon.com/images/I/71aJod8yuiL._AC_SL1300_.jpg" },
  { id: "f_new_6", name: "Lampe de bureau Chapeau de Paille", category: "produits dérivés", link: "https://amzn.to/4gTHes4", image: "https://m.media-amazon.com/images/I/81EkZSqki+L._AC_SL1500_.jpg" },
  { id: "f_new_7", name: "Funko Pop Animation Metallic Exclusivité", category: "produits dérivés", link: "https://amzn.to/4pbGBML", image: "https://m.media-amazon.com/images/I/81Lyh6TZK9L._AC_SL1500_.jpg" },
];

export default function Boutique() {
  const [activeCategory, setActiveCategory] = useState<Category>("mangas");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-12 flex flex-col md:flex-row relative">
        <div className="w-full md:w-1/3 h-48 md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-black shrink-0 relative">
          <img src="https://i.imgur.com/TXJ4obL.jpeg" alt="Boutique One Piece" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent flex items-end md:items-center p-6">
            <h2 className="font-heading font-black text-3xl uppercase tracking-tighter text-white drop-shadow-lg">
              La Boutique
            </h2>
          </div>
        </div>
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-400 p-3 rounded-2xl border-2 border-black shrink-0">
              <ShoppingBag className="w-6 h-6 text-black" />
            </div>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Soutenez le site en découvrant notre sélection de coffrets mangas et produits dérivés.
            </p>
          </div>
          <p className="text-xs text-gray-700 bg-amber-50 p-4 rounded-xl border border-amber-200 mt-auto">
            <strong>Transparence :</strong> Les liens ci-dessous sont des liens d'affiliation. Si vous passez par ces liens pour vos achats, nous touchons une petite commission de la part du vendeur sans aucun surcoût pour vous. C'est un excellent moyen de soutenir la maintenance et l'évolution du site ! 🏴‍☠️
          </p>
        </div>
      </div>

      {/* Mini-Amazon Interface */}
      <div className="bg-slate-50 border-2 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col min-h-[600px]">
        {/* Navigation & Search Bar */}
        <div className="bg-white border-b-2 border-black p-4 flex flex-col md:flex-row items-center gap-4 sticky top-0 z-10">
          
          {/* Tabs */}
          <div className="flex items-center w-full md:w-auto bg-slate-100 rounded-xl p-1 border-2 border-slate-200 shrink-0">
            <button 
              onClick={() => setActiveCategory("mangas")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-heading font-black text-sm uppercase transition-all ${
                activeCategory === "mangas" ? "bg-white shadow-sm border border-slate-200 text-black" : "text-slate-500 hover:text-black hover:bg-slate-200/50"
              }`}
            >
              <Book className="w-4 h-4" /> Mangas
            </button>
            <button 
              onClick={() => setActiveCategory("produits dérivés")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-heading font-black text-sm uppercase transition-all ${
                activeCategory === "produits dérivés" ? "bg-white shadow-sm border border-slate-200 text-black" : "text-slate-500 hover:text-black hover:bg-slate-200/50"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Produits dérivés
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder={`Rechercher des ${activeCategory === 'mangas' ? 'coffrets mangas' : 'produits dérivés'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl py-3 pl-12 pr-4 font-sans text-sm focus:outline-none focus:ring-4 focus:ring-amber-400/20 transition-shadow"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-6 flex-1 bg-slate-50 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <a 
                  key={product.id}
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-sm hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all flex flex-col group cursor-pointer"
                >
                  <div className="h-48 bg-white p-4 flex items-center justify-center border-b-2 border-slate-100 relative group-hover:border-amber-200 transition-colors">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:drop-shadow-xl transition-all group-hover:scale-105" 
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-amber-400 text-black p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 shadow-sm border border-black">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-heading font-black text-sm text-[#1A1A1A] line-clamp-2 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center text-xs font-bold text-amber-600 uppercase tracking-wider">
                      Voir l'offre <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-heading font-bold text-lg text-slate-500">Aucun résultat trouvé.</p>
              <p className="text-sm">Essayez une autre recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
