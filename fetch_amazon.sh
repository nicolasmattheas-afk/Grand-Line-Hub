#!/bin/bash
LINKS=(
"https://amzn.to/3QQGDgq"
"https://amzn.to/4wpdXtX"
"https://amzn.to/4bi6AMD"
"https://amzn.to/3QDTxyi"
"https://amzn.to/4wps1nj"
"https://amzn.to/4p0jmVZ"
"https://amzn.to/4y9yvIL"
"https://amzn.to/4f1TEvL"
"https://amzn.to/4vCNglw"
"https://amzn.to/4y2Q64W"
"https://amzn.to/4p5vR2v"
"https://amzn.to/4vCNLfo"
"https://amzn.to/4p0Ctix"
"https://amzn.to/4gklKEI"
"https://amzn.to/4gfi5rG"
"https://amzn.to/4eTE1pY"
"https://amzn.to/4aAD2d0"
"https://amzn.to/4f1TIvv"
"https://amzn.to/4f17het"
"https://amzn.to/4vFUOUz"
"https://amzn.to/4v6Gnrx"
"https://amzn.to/4gQVfXx"
"https://amzn.to/4eVDcNw"
"https://amzn.to/3TeLR6e"
"https://amzn.to/44OmlqZ"
"https://amzn.to/44J6ES0"
"https://amzn.to/44KsG6Q"
"https://amzn.to/4eTE7Om"
"https://amzn.to/4vgL3v7"
"https://amzn.to/3SGCdJA"
"https://amzn.to/4gf8MYP"
"https://amzn.to/3SWC9p2"
"https://amzn.to/4vU3UNF"
"https://amzn.to/3QVcexh"
"https://amzn.to/4vEiUPy"
"https://amzn.to/4eR4Jzu"
)

echo "export const NEW_PRODUCTS = ["
i=1
for link in "${LINKS[@]}"; do
  loc=$(curl -s -I "$link" | grep -i location | awk '{print $2}' | tr -d '\r')
  # Extract DP or gp/product id
  if [[ "$loc" =~ /dp/([A-Z0-9]+) ]]; then
    dp="${BASH_REMATCH[1]}"
  elif [[ "$loc" =~ /product/([A-Z0-9]+) ]]; then
    dp="${BASH_REMATCH[1]}"
  else
    dp="UNKNOWN"
  fi
  
  # Extract name
  if [[ "$loc" =~ amazon\.fr/([^/]+)/dp/ ]]; then
    name="${BASH_REMATCH[1]}"
    name=$(echo "$name" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')
  else
    name="Figurine One Piece $i"
  fi

  # Image url
  img="https://m.media-amazon.com/images/P/${dp}.01._SCLZZZZZZZ_.jpg"

  echo "  { id: \"f_$i\", name: \"$name\", category: \"figurines\", link: \"$link\", image: \"$img\" },"
  i=$((i+1))
done
echo "];"
