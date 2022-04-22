import React, { Component } from 'react';
import styled from 'styled-components/native';
import Theme from '../theme/theme'


const NappButtonView = styled.TouchableOpacity`
  border-radius: 25;
  background-color: ${prop => prop.backgroundColor};
  justify-content: center;
  align-items: center;
  width: 90%;
  height:50;
  
`;
const ButtonText = styled.Text`
    color:${props => props.color};
    font-size:${props => Theme.fontSize.regular}
    font-family:${props => Theme.fontFamily.medium}

`;
export default class NappSubmitButton extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    nappSubmitButtonPressed = () => {
        this.props.onPress();
    }

    render() {
        const {
            backgroundColor,
            text,
            textColor
        } = this.props;

        return (
            <NappButtonView onPress={() => this.nappSubmitButtonPressed()}
                backgroundColor={backgroundColor}
                activeOpacity={0.7}>
                <ButtonText color={textColor}>{text}</ButtonText>
            </NappButtonView>
        )
    }

}