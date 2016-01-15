# fluc
Unofficial simple Flic button support in NodeJS (requires Noble)

This is a rudimentary and probably incorrect handler for Flic buttons. It does not pair with buttons but instead uses the device name as way to support multiple buttons. The example bash shell runfluc.sh reads the output from running "node fluc" and executes any AppleScript it finds in the "flucs" directory matching the button name and event type "flucs/Fexample/[Click.scpt/Double.scpt/Hold.scpt]"

It will only communicate with any unpaired Flic buttons.

No security precautions here.

Have fun.



