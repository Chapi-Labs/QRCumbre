import React, { Component } from 'react';

import {
    Alert,
    Linking,
    Dimensions,
    LayoutAnimation,
    Text,
    View,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

export default class App extends Component {
    state = {
        hasCameraPermission: null,
        userData: null
    };

    _handleBarCodeRead = result => {
        if (result.data !== this.state.userData) {
            LayoutAnimation.spring();
            const data = JSON.parse(result.data);
            fetch('https://chapievent.chapilabs.com/api/events/verify', {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify({
                    event_id: data.event_id,
                    email: data.email
                })
            })
                .then(result => result.json())
                .then(result => {
                    this.setState({ userData: data, valid: result.valid });
                });
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <QRCodeScanner
                    onRead={this._handleBarCodeRead.bind(this)}
                    reactivate={true}
                    reactivateTimeout={3000}
                />
                {this._maybeRenderUrl()}
            </View>
        );
    }

    _handlePressUrl = () => {
        Alert.alert(
            'Open this URL?',
            this.state.lastScannedUrl,
            [
                {
                    text: 'Yes',
                    onPress: () => Linking.openURL(this.state.userData)
                },
                { text: 'No', onPress: () => {} }
            ],
            { cancellable: false }
        );
    };

    _handlePressCancel = () => {
        this.setState({ userData: null });
    };

    _maybeRenderUrl = () => {
        if (!this.state.userData) {
            return;
        }

        return (
            <View
                style={
                    this.state.valid
                        ? styles.bottomBar
                        : styles.bottomBarInvalid
                }
            >
                <TouchableOpacity style={styles.url}>
                    <Text numberOfLines={3} style={styles.urlText}>
                        {this.state.userData.email} {'\n'}
                        {this.state.userData.username} {'\n'}
                        {this.state.valid === true ? 'Válido' : 'Inválido'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={this._handlePressCancel}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
    },
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
        padding: 16
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#44bd32',
        padding: 15,
        flexDirection: 'row'
    },
    bottomBarInvalid: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#e84118',
        padding: 15,
        flexDirection: 'row'
    },
    url: {
        flex: 1
    },
    urlText: {
        color: '#fff',
        fontSize: 20
    },
    cancelButton: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18
    }
});
