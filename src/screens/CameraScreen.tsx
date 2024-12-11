import React from 'react';
import { View, Text, Image } from 'react-native';
import { CameraStyles } from '../styles/GlobalStyles';

const CameraScreen = () => {
    return (
        <View style={CameraStyles.container}>
            <View style={CameraStyles.mainContent}>
                <View style={CameraStyles.cameraPreview}>
                    <Image 
                        source={require('../../assets/images/TiltPhone.png')}
                        style={CameraStyles.tiltPhoneImage}
                    />
                </View>
                <Text style={CameraStyles.instructionText}>
                    <Text style={CameraStyles.normalText}>
                        후면 카메라 방향은{' '}
                    </Text>
                    <Text style={CameraStyles.highlightText}>
                        길쪽으로 {'\n'} 
                    </Text>
                    <Text style={CameraStyles.normalText}> 휴대전화를{' '} </Text>
                    <Text style={CameraStyles.highlightText}>
                        약간 기울여주세요
                    </Text>
                </Text>
            </View>
        </View>
    );
};

export default CameraScreen;
