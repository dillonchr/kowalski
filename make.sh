LOCATION=/tmp/frames

if [ ! -d "$LOCATION" ]; then
  mkdir -p "$LOCATION"
fi

ID="$(curl -s https://parksconservancy.siteproxy.net/api/session\?doc\=East+Beach+Webcam\&kind\=ctl\&mode\=MJPEG\&stream\=East_Beach_Webcam_MJPEG_640x480\&msg\=1\&cmd\=open | egrep -o 'key="id" value="([A-Z0-9_]+)"' | sed -n -E 's/.*value="([^"]+)"/\1/p')"
URL="http://173.164.254.148/vid.cgi?id=${ID}&doc=East%20Beach%20Webcam&i=1"

if [ "$?" -eq "0" ]; then
  for i in $(seq -w 1 20)
  do
    curl -s "${URL}&r=${RANDOM}" > "${LOCATION}/fr-$(date +"%s")-${i}.jpg"
    if [ ! "$?" -eq "0" ]; then
      echo "Failed to download /shrug"
      exit 2
    fi
  done

  ANIM_PATH="${LOCATION}/anim-$(date +"%s").gif"
  convert -delay 15 -loop 0 "${LOCATION}/fr-*.jpg" $ANIM_PATH

  if [ "$?" -eq "0" ]; then
    echo $ANIM_PATH
  else
    echo "Dang. Sorry dude."
  fi
  rm $LOCATION/fr-*.jpg
else
  echo "Sorry dude."
fi
