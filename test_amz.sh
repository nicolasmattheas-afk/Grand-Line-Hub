#!/bin/bash
LINKS=(
"https://amzn.to/4vjdmcv"
"https://amzn.to/3SIrZs9"
"https://amzn.to/4viYgDM"
)

i=1
for link in "${LINKS[@]}"; do
  loc=$(curl -s -I "$link" | grep -i location | awk '{print $2}' | tr -d '\r')
  if [[ "$loc" =~ /dp/([A-Z0-9]+) ]]; then
    dp="${BASH_REMATCH[1]}"
  elif [[ "$loc" =~ /product/([A-Z0-9]+) ]]; then
    dp="${BASH_REMATCH[1]}"
  else
    dp="UNKNOWN"
  fi
  
  if [[ "$loc" =~ amazon\.fr/([^/]+)/dp/ ]]; then
    name="${BASH_REMATCH[1]}"
    name=$(echo "$name" | tr '-' ' ' | awk '{for(j=1;j<=NF;j++)sub(/./,toupper(substr($j,1,1)),$j)}1')
  else
    name="Manga One Piece"
  fi
  img="https://m.media-amazon.com/images/P/${dp}.01._SCLZZZZZZZ_.jpg"
  echo "{ id: \"m_new_$i\", name: \"$name\", category: \"mangas\", link: \"$link\", image: \"$img\" },"
  i=$((i+1))
done
