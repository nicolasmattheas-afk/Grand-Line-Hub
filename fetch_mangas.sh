#!/bin/bash
LINKS=(
"https://amzn.to/4eIFCjJ"
"https://amzn.to/4gRxC10"
"https://amzn.to/4p1gjMY"
"https://amzn.to/4wsNpIu"
"https://amzn.to/4eR5mck"
"https://amzn.to/4fhaSq1"
"https://amzn.to/3ReaWxG"
"https://amzn.to/4vfpc7t"
"https://amzn.to/44IhNm5"
"https://amzn.to/4f1UEA1"
"https://amzn.to/4wnWdir"
"https://amzn.to/4ge9Fkm"
"https://amzn.to/4oYiFMF"
"https://amzn.to/3SCa5Y5"
"https://amzn.to/3SZdUqd"
"https://amzn.to/4p6dTwW"
"https://amzn.to/4eVDp3b"
"https://amzn.to/4ges9kJ"
"https://amzn.to/4eRgHsR"
"https://amzn.to/4gkldT7"
"https://amzn.to/3QU5dNe"
"https://amzn.to/4gk9K6a"
"https://amzn.to/4eMP6ZK"
"https://amzn.to/3QB3HQh"
"https://amzn.to/4gk8lMO"
"https://amzn.to/4vfadua"
"https://amzn.to/4vJet65"
"https://amzn.to/4wo7sYm"
"https://amzn.to/4b4hXru"
"https://amzn.to/44Kemv8"
"https://amzn.to/44EVWvQ"
"https://amzn.to/44HPW5p"
"https://amzn.to/44a2FxK"
)

i=11
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
    name=$(echo "$name" | sed 's/%[A-Z0-9][A-Z0-9]//g')
  else
    name="One Piece Manga $i"
  fi

  # Image url
  img="https://m.media-amazon.com/images/P/${dp}.01._SCLZZZZZZZ_.jpg"

  echo "  { id: \"m_$i\", name: \"$name\", category: \"mangas\", link: \"$link\", image: \"$img\" },"
  i=$((i+1))
done
