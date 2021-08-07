import React, { FunctionComponent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Wrapper,
  Header,
  StyledModal,
  HeaderText,
  CloseButton,
  Content,
  Backdrop,
} from './modal.style';
export interface ModalProps {
  isShown: boolean;
  hide: () => void;
  modalContent: JSX.Element;
  headerText: string;
}
export const Modal: FunctionComponent<ModalProps> = ({
  isShown,
  hide,
  modalContent,
  headerText,
}) => {
  const modal = (
    <React.Fragment>
      <Backdrop />
      <Wrapper>
        <StyledModal>
          <Header>
            {/* <HeaderText>{headerText}</HeaderText> */}
            <CloseButton onClick={hide}>X</CloseButton>
          </Header>
          <Content>
          <iframe width="700" height="440" src="https://maps.google.com/maps?width=700&amp;height=440&amp;hl=en&amp;q=London%2C%20United%20Kingdom+(Title)&amp;ie=UTF8&amp;t=&amp;z=10&amp;iwloc=B&amp;output=embed" frameBorder={0} scrolling="no" marginHeight={0} marginWidth={0}>
              </iframe>
          </Content>
        </StyledModal>
      </Wrapper>
    </React.Fragment>
  );
  return isShown ? ReactDOM.createPortal(modal, document.body) : null;
};