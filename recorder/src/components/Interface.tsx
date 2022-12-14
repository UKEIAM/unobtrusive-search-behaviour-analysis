import { render } from '@testing-library/react'
import React, { Component } from 'react'
import { Button, Input, TextField, Box, withTheme } from '@mui/material'
import { MarginProps } from '@mui/system'

class Interface extends Component<{}> {
    constructor(props: any) {
        super(props)
    }
    render() {
        return (
            <div>
                <div>
                    <button className="button"> Testbutton </button>
                </div>
                <div></div>
            </div>
        )
    }
}
export default Interface
