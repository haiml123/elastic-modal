import * as React from 'react'

const useWithoutProvider = (modalEntry : any) : void => {
    throw new Error( 'Attempted to call useModal outside of modal context. Make sure your component is inside ModalProvider.' )
}

export const ElasticModalContext = React.createContext({
    addModal: useWithoutProvider,
    removeModal: useWithoutProvider
})
