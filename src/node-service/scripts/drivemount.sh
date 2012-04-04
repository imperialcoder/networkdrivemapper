#!/bin/sh
SERVER=//$1
SHARENAME=$2
LOCALMOUNT=$3
USERNAME=$4
PASSWORD=$5
DOMAIN=$6
SPEEDREAD=$7
SPEEDWRITE=$8
READMODE=$9
USERDELIMITER=''
GUEST='guest'

LEN=${#READMODE}
if [[ $LEN -lt 1 ]]
then
    READMODE='rw'
fi

#rsize=
LEN=${#SPEEDREAD}
if [[ $LEN -gt 0 ]]
then
    SPEEDREAD=',rsize=${SPEEDREAD}'
fi

LEN=${#SPEEDWRITE}
if [[ $LEN -gt 0 ]]
then
    SPEEDWRITE=',wsize=${SPEEDWRITE}'
fi



LEN=${#USERNAME}
if [[ $LEN -gt 0 ]]
then
    USERNAME="username=${USERNAME}"
    USERDELIMITER=','
    GUEST=''
fi
LEN=${#PASSWORD}
if [[ $LEN -gt 0 ]]
then
    PASSWORD="${USERDELIMITER}password=${PASSWORD}"
    USERDELIMITER=','
    GUEST=''
fi
if [[ ${#USERNAME} -gt 0 ]]
then =
    if [[ ${#PASSWORD} -eq 0 ]]
    then
        PASSWORD="${USERDELIMITER}password="
        #echo 'user name set but no password'
    fi
fi
LEN=${#DOMAIN}
if [[ $LEN -gt 0 ]]
then
    DOMAIN="${USERDELIMITER}domain=${DOMAIN}"
    GUEST=''
fi
USERAUTH="${GUEST}${USERNAME}${PASSWORD}${DOMAIN}"

    #Mount the path to the desired mount point
    mount.cifs "$SERVER/$SHARENAME" "$LOCALMOUNT" -o $USERAUTH,$READMODE,iocharset=utf8 $SPEEDREAD $SPEEDWRITE
    

    #Iterate through all jailed apps and add in the respective mounting
    
    for DIR in `find /var/palm/jail -maxdepth 3 -mindepth 3 -type d -name "internal"`
    do
        
        #
        #Build respective jail path for current jailed app in the loop:
        #
        
        #remove usb root path from mountpoint 
        STRIP=/media/internal/
        LOCALMOUNTSTUB=${LOCALMOUNT#$STRIP}
        
        #Construct the final path to be mounted for the jailed app
        JAILMOUNT=$DIR/${LOCALMOUNTSTUB}
        
        #Mount jailed folder for current app if folder exists
        if [ -e "${JAILMOUNT}" ]
        then
            mount.cifs "$SERVER/$SHARENAME" "$JAILMOUNT" -o $USERAUTH,$READMODE,iocharset=utf8 $SPEEDREAD $SPEEDWRITE || true
        fi
    done
