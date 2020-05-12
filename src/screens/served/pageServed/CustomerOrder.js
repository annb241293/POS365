import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ActivityIndicator, Image, View, StyleSheet, Picker, Text, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Colors, Images, Metrics } from '../../../theme';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import dataManager from '../../../data/DataManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiPath } from '../../../data/services/ApiPath';
import dialogManager from '../../../components/dialog/DialogManager';
import { HTTPService } from '../../../data/services/HttpService';
import { getFileDuLieuString } from '../../../data/fileStore/FileStorage';
import { Constant } from '../../../common/Constant';

export default (props) => {

    const [listPosition, setListPosition] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [list, setListOrder] = useState(() => props.listProducts)
    const [vendorSession, setVendorSession] = useState({})
    const [itemOrder, setItemOrder] = useState({})
    const [value, setValue] = useState(123)

    useEffect(() => {
        console.log("Customer props ", props);
        const getVendorSession = async () => {
            let data = await getFileDuLieuString(Constant.VENDOR_SESSION, true);
            console.log('data', JSON.parse(data));
            setVendorSession(JSON.parse(data));
        }
        getVendorSession()

        init()
        return () => {
            console.log(dataManager.dataChoosing, 'dataManager.dataChoosing');
        }
    }, [])

    const init = () => {
        let tempListPosition = dataManager.dataChoosing.filter(item => item.Id == props.route.params.room.Id)
        if (tempListPosition && tempListPosition.length > 0) {
            console.log('from tempListPosition');
            setListPosition(tempListPosition[0].data)
        }
    }

    useEffect(() => {
        console.log(listPosition, 'listPosition');
    }, [listPosition])

    const syncListProducts = (listProducts) => {
        console.log('syncListProducts');
        setListOrder(listProducts)
        props.outputListProducts(listProducts)
    }

    useEffect(() => {
        console.log('useEffect props.position', props.position);
        listPosition.forEach(element => {
            if (element.key == props.position) {
                syncListProducts([...element.list])
            } else {
                console.log('not exist this position');

            }
        })
    }, [props.position, listPosition])

    useEffect(() => {
        if (props.listProducts.length == 0) {
            return
        }
        console.log('useEffect props.listProducts', props.listProducts);
        let exist = false
        listPosition.forEach(element => {
            if (element.key == props.position) {
                exist = true
                element.list = props.listProducts
            }
        })
        if (!exist) {
            listPosition.push({ key: props.position, list: props.listProducts })
        }
        setListOrder(props.listProducts)
        savePosition()
    }, [props.listProducts])

    const savePosition = () => {
        let exist = false
        dataManager.dataChoosing.forEach(element => {
            if (element.Id == props.route.params.room.Id) {
                exist = true
                element.data = [...listPosition]
            }
        })
        if (!exist) {
            dataManager.dataChoosing.push({ Id: props.route.params.room.Id, data: [...listPosition] })
        }
        console.log(dataManager.dataChoosing, 'savePosition');
    }

    const sendOrder = () => {
        let ls = [];
        ls = JSON.parse(JSON.stringify(list))
        console.log("sendOrder", ls, vendorSession);
        let params = {
            ServeEntities: []
        };
        ls.forEach(element => {
            let obj = {
                BasePrice: element.Price,
                Code: element.Code,
                Name: element.Name,
                OrderQuickNotes: [],
                Position: props.position,
                Price: element.Price,
                Printer: element.Printer,
                Printer3: null,
                Printer4: null,
                Printer5: null,
                ProductId: element.Id,
                Quantity: element.Quantity,
                RoomId: props.route.params.room.Id,
                RoomName: props.route.params.room.Name,
                SecondPrinter: null,
                Serveby: vendorSession.CurrentUser && vendorSession.CurrentUser.Id ? vendorSession.CurrentUser.Id : ""
            }
            params.ServeEntities.push(obj)
        });
        dialogManager.showLoading();
        new HTTPService().setPath(ApiPath.SAVE_ORDER).POST(params).then((res) => {
            console.log("sendOrder res ", res);
            dialogManager.hiddenLoading()
        }).catch((e) => {
            console.log("sendOrder err ", e);
            dialogManager.hiddenLoading()
        })
    }

    let _menu = null;

    const setMenuRef = ref => {
        _menu = ref;
    };

    const hideMenu = () => {
        _menu.hide();
    };

    const showMenu = () => {
        _menu.show();
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    {
                        list.map((item, index) => {
                            return item.Quantity > 0 ? (
                                <TouchableOpacity key={index} onPress={() => {
                                    setItemOrder(item)
                                    setValue(154)
                                    setShowModal(!showModal)
                                }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", padding: 10, borderBottomColor: "#ABB2B9", borderBottomWidth: 0.5 }}>
                                        <TouchableOpacity onPress={() => {
                                            console.log('delete');
                                            item.Quantity = 0
                                            setListOrder([...list])
                                            props.outputListProducts([...list])
                                        }}>
                                            <Icon name="trash-can-outline" size={50} color="black" />
                                        </TouchableOpacity>
                                        <View style={{ flexDirection: "column", flex: 1 }}>
                                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 7 }}>{item.Name}</Text>
                                            <Text>{item.Price}x</Text>
                                        </View>
                                        <View style={{ alignItems: "center", flexDirection: "row" }}>
                                            <TouchableOpacity onPress={() => {
                                                item.Quantity++
                                                props.outputListProducts([...list])
                                            }}>
                                                <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>+</Text>
                                            </TouchableOpacity>
                                            <Text style={{ padding: 20 }}>{item.Quantity}</Text>
                                            <TouchableOpacity onPress={() => {
                                                item.Quantity--
                                                setListOrder([...list])
                                                props.outputListProducts([...list])
                                            }}>
                                                <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>-</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity
                                            style={{ marginLeft: 10 }}
                                            onPress={() => {
                                                console.log(props, 'item');
                                                props.navigation.navigate("Topping")
                                            }}>
                                            <Icon name="access-point" size={50} color="orange" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ) :
                                null
                        })
                    }
                </ScrollView>
            </View>
            <View style={{ height: 50, flexDirection: "row", backgroundColor: "#0072bc", alignItems: "center" }}>
                <TouchableOpacity onPress={showMenu}>
                    <Menu
                        ref={setMenuRef}
                        button={<Image style={{ width: 24, height: 24, margin: 20 }} source={Images.icon_menu} />}
                    >
                        <View style={{
                            padding: 5,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                        }}>
                            <Text style={{ margin: 15, fontSize: 16 }}>Giờ vào: 27/04/2020 08:00</Text>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => _menu.hide()}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Yêu cầu thanh toán</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => _menu.hide()}>
                                <Image style={{ width: 20, height: 20 }} source={Images.icon_notification} />
                                <Text style={{ margin: 15, fontSize: 16 }}>Gửi thông báo tới thu ngân</Text>
                            </TouchableOpacity>
                        </View>
                    </Menu>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOrder} style={{ flex: 1, justifyContent: "center", alignItems: "center", borderLeftColor: "#fff", borderLeftWidth: 2, height: "100%" }}>
                    <Text style={{ fontSize: 18, color: "#fff", fontWeight: "bold" }}>Gửi thực đơn</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => {
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <TouchableWithoutFeedback
                        onPress={() => setShowModal(false)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}>
                        <View style={[{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }, { backgroundColor: 'rgba(0,0,0,0.5)' }]}></View>

                    </TouchableWithoutFeedback>
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{
                            padding: 0,
                            backgroundColor: "#fff", borderRadius: 4, marginHorizontal: 20,
                            width: Metrics.screenWidth * 0.8
                        }}>
                            <View style={{ backgroundColor: Colors.colorchinh, borderTopRightRadius: 4, borderTopLeftRadius: 4, }}>
                                <Text style={{ margin: 10, textTransform: "uppercase", fontSize: 20, marginLeft: 20, color: "#fff" }}>{itemOrder.Name}</Text>
                            </View>
                            <View style={{ padding: 10 }}>
                                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                                    <Text style={{ fontSize: 16, flex: 3 }}>Đơn giá</Text>
                                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                                        <Text style={{ paddingHorizontal: 20, paddingVertical: 20, flex: 1, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }}>{itemOrder.Price}</Text>
                                    </View>

                                </View>
                                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} >
                                    <Text style={{ fontSize: 16, flex: 3 }}>Số lượng</Text>
                                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                                        <TouchableOpacity onPress={() => {
                                            itemOrder.Quantity++
                                            setValue({ ...itemOrder })
                                        }}>
                                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>+</Text>
                                        </TouchableOpacity>
                                        <TextInput style={{ padding: 20,textAlign: "center", margin: 10, flex: 1, borderRadius: 4, borderWidth: 0.5 }} value={"" + itemOrder.Quantity} />
                                        <TouchableOpacity onPress={() => {
                                            itemOrder.Quantity--
                                            setValue({ ...itemOrder })
                                        }}>
                                            <Text style={{ borderWidth: 1, padding: 20, borderRadius: 10 }}>-</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ padding: 0, flexDirection: "row", justifyContent: "center" }} onPress={() => setShowModal(false)}>
                                    <Text style={{ fontSize: 16, flex: 3 }}>Ghi chú</Text>
                                    <View style={{ alignItems: "center", flexDirection: "row", flex: 7 }}>
                                        <TextInput numberOfLines={4} multiline={true} style={{ height: 100, paddingHorizontal: 20, paddingVertical: 5, flex: 7, fontSize: 16, borderWidth: 0.5, borderRadius: 4 }} value={itemOrder.Price} placeholder="Nhập ghi chú" />
                                    </View>
                                </View>
                                <View style={{ alignItems: "center", justifyContent: "space-between", flexDirection: "row", marginTop: 10 }}>
                                    <TouchableOpacity style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} onPress={() => { }}>
                                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Huỷ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: "#fff" }} onPress={() => { }}>
                                        <Text style={{ color: Colors.colorchinh, textTransform: "uppercase" }}>Topping</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ alignItems: "center", margin: 2, flex: 1, borderWidth: 1, borderColor: Colors.colorchinh, paddingHorizontal: 10, paddingVertical: 15, borderRadius: 4, backgroundColor: Colors.colorchinh }} onPress={() => { }}>
                                        <Text style={{ color: "#fff", textTransform: "uppercase", }}>Xong</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}