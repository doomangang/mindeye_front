import React from 'react';
import {render} from '@testing-library/react-native';
import CameraScreen from '../screens/CameraScreen';

describe('CameraScreen', () => {
  it('renders correctly', () => {
    const {getByText, getByLabelText} = render(<CameraScreen />);

    expect(getByLabelText('Camera preview')).toBeTruthy();
    expect(getByText('후면 카메라 방향은 길쪽으로 휴대전화를 약간 기울여주세요')).toBeTruthy();
  });
});
