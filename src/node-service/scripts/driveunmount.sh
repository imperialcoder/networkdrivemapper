#!/bin/ash
LOCALMOUNT=$1

#unmount main share
umount "$LOCALMOUNT"

#unmount jailed app shares for same mount point:
for DIR in `find /var/palm/jail -maxdepth 3 -mindepth 3 -type d -name "internal"`
do
  STRIP=/media/internal/
  LOCALMOUNTSTUB=${LOCALMOUNT#$STRIP}
  JAILMOUNT=$DIR/${LOCALMOUNTSTUB}
  if grep -qs "$JAILMOUNT" /proc/mounts
  then
      #echo "Unmounting $JAILMOUNT"
      umount "$JAILMOUNT" || true
  fi
done
