import {forwardRef} from "react";


const Overlay = (props: any, ref: any)=> {
    const classes = `${(props.overlayClasses || '')} overlay`;


    return (<div style={props?.overlayStyle}
                 ref={ref}
                 onAnimationEnd={(e)=> props?.onAnimationEnd(e)}
                 onClick={(e)=> props?.onBackdropClicked(e)}
                 className={classes}>
    </div>);
}



export default forwardRef(Overlay)