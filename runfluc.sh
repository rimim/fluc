#!/bin/bash
hdl_fluc() {
    while read evt
    do
        FLUC=`echo $evt | awk '{ print $1 }'`
        CMD=`echo $evt | awk '{ print $2 }'`
        BUTTON=`echo $evt | awk '{ print $3 }'`
        if [ "$FLUC" == "[FLUC]" ]; then
            HANDLER=`pwd`"/flucs/${BUTTON}/${CMD}.scpt"
            if [ -f "$HANDLER" ]; then
                osascript "$HANDLER"
            else
                echo "No handler for ${BUTTON}. Looking for $HANDLER"
            fi
        fi
    done
}

node fluc | hdl_fluc
