var noble = require('noble');

var flicServiceUuid = 'f02adfc026e711e49edc0002a5d5c51b';
var flicCtrlUuid = 'cc7efce026e811e48fd20002a5d5c51b';
var flicDataUuid = '06053ec026e911e4adc20002a5d5c51b';

var flictionary = {};

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        console.log('scanning...');
        noble.startScanning([flicServiceUuid], false);
    }
    else {
        console.log('state change: ', state);
        noble.stopScanning();
    }
})

noble.on('discover', function(peripheral) {

    peripheral.connect(function(err) {

        peripheral.discoverServices([flicServiceUuid], function(err, services) {
            services.forEach(function(service) {

                service.discoverCharacteristics([], function(err, characteristics) {

                    var flicCtrl = null;
                    var flicData = null;
                    var flicName = peripheral.advertisement.localName;
                    var flicClickCount = flictionary[flicName];
                    var flicRSSI = peripheral.rssi;
                    var flicAddress = peripheral.address;

                    characteristics.forEach(function(characteristic) {
                        if (flicCtrlUuid == characteristic.uuid) {
                            flicCtrl = characteristic;
                        }
                        else if (flicDataUuid == characteristic.uuid) {
                            flicData = characteristic;
                        }
                    })

                    if (flicCtrl && flicData) {
                        flicCtrl.read(function(err, data) {
                            if (!err && data && data.length == 20 && data.readUInt8(0) == 66) {
                                // 'B'
                                var buf = new Buffer([4, 160, 0, 65, 1, 232, 1, 1, 2, 90, 0, 95, 0, 1]);
                                flicCtrl.write(buf, false, function(err) {
                                    if (!err) {
                                        flicData.read(function(err, data) {
                                            if (!err && data && data.length == 15) {
                                                // format is:
                                                // TAG:  96
                                                // BUTTON COUNT:  190 4
                                                // BUTTON VERSION/TYPE?:  0 1
                                                // UNKNOWN1:  0 0
                                                // UNKNOWN2:  78 0
                                                // UNKNOWN3:  64 6
                                                // CHKSUM: 13 173 37 60

                                                var cmdCode = data.readUInt8(0);
                                                var btnCnt = (data.readUInt8(1) | (data.readUInt8(2) << 8));
                                                var unknown0 = data.readUInt8(3);
                                                var pwrCnt = data.readUInt8(4); // 1-99
                                                var unknown1 = data.readUInt8(5);
                                                var unknown2 = data.readUInt8(6);
                                                var unknown3 = data.readUInt8(7);
                                                var unknown4 = data.readUInt8(8);
                                                var unknown5 = data.readUInt8(9);
                                                var unknown6 = data.readUInt8(10);
                                                var c0 = data.readUInt8(11);
                                                var c1 = data.readUInt8(12);
                                                var c2 = data.readUInt8(13);
                                                var c3 = data.readUInt8(14);
                                                var chksum_le = ((c3<<24)+(c2<<16)+(c1<<8)+c0);
                                                var chksum_be = ((c0<<24)+(c1<<16)+(c2<<8)+c3);

                                                if (cmdCode == 96) {
                                                    var keyType = "CLICK";
                                                    if (btnCnt & 1) {
                                                        keyType = "HOLD";
                                                    }
                                                    else if (flicClickCount && flicClickCount + 4 == btnCnt) {
                                                        keyType = "DOUBLE";
                                                    }
                                                    console.log('[FLUC]', keyType, flicName, btnCnt, flicRSSI, flicAddress);
                                                    // console.log(
                                                    //     'BUTTON:', peripheral.advertisement.localName,
                                                    //     'count:', btnCnt,
                                                    //     'pwr:', pwrCnt,
                                                    //     'UNKNOWN:', unknown0, unknown1, unknown2, unknown3, unknown4, unknown5, unknown6,
                                                    //     'CHKSUM:', c0, c1, c2, c3,
                                                    //     'ADDRESS:', peripheral.address,
                                                    //     'RSSI:', peripheral.rssi);
                                                    flictionary[flicName] = btnCnt;
                                                }
                                                else
                                                {
                                                    console.log('ERROR cmd=', cmdCode);
                                                }
                                                noble.stopScanning();
                                                peripheral.disconnect();
                                                noble.startScanning([flicServiceUuid], false);
                                                // console.log(peripheral);
                                            }
                                        })
                                    }
                                    else {
                                        console.log('crust error');
                                    }
                                })
                            }
                            else {
                                console.log('UNEXPECTED: ', data.length);
                                // console.log('READ : ',   data.readUInt8(0), data.readUInt8(1), data.readUInt8(2), data.readUInt8(3),
                                //                          data.readUInt8(4), data.readUInt8(5), data.readUInt8(6), data.readUInt8(7),
                                //                          data.readUInt8(8), data.readUInt8(9), data.readUInt8(10), data.readUInt8(11),
                                //                          data.readUInt8(12), data.readUInt8(13));
                            }
                        })
                    }
                })
            })
        })
    })
})
