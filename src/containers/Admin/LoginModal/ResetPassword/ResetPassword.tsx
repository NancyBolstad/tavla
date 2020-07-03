import React, { useState, Dispatch, SetStateAction } from 'react'
import firebase from 'firebase'

import { TextField, InputGroup } from '@entur/form'
import { GridContainer, GridItem } from '@entur/grid'
import { EmailIcon, BackArrowIcon } from '@entur/icons'
import { PrimaryButton } from '@entur/button'
import { Heading2, Paragraph } from '@entur/typography'

import { useFormFields } from '../../../../utils'
import { ModalType } from '../.'

import './styles.scss'

import sikkerhetBom from '../../../../assets/images/sikkerhet_bom.png'
import retinaSikkerhetBom from '../../../../assets/images/sikkerhet_bom@2x.png'


export interface UserResetPassword {
    email: string
}

interface Props {
    setModalType: Dispatch<SetStateAction<ModalType>>
}


const ResetPassword = ({ setModalType}: Props): JSX.Element => {
    const [inputs, handleInputsChange] = useFormFields<UserResetPassword>({
        email: '',
    })

    const [emailError, setEmailError] = useState<string>()

    const handleReset = () => {
        firebase
            .auth()
            .sendPasswordResetEmail(inputs.email)
            .then(function() {
                // Email sent.
            })
            .catch(function(error) {
                if (error.code === 'auth/invalid-email') {
                    setEmailError('E-posten er ikke gyldig')
                }
                else if (error.code === 'auth/user-not-found') {
                    setEmailError('Vi finner ingen konto med denne e-posten.')
                }
                else (error.code === 'auth/too-many-requests') {
                    setEmailError('For mange forsøk, prøv igjen senere.')
                }
            })
    }

    return (
        <>
        <BackArrowIcon
                size={30}
                onClick={() => setModalType('LoginEmailModal')}
                className="go-to"
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                    src={sikkerhetBom}
                    srcSet={`${retinaSikkerhetBom} 2x`}
                    style={{ width: '45%', margin: '0 auto' }}
                />
            </div>
            <Heading2 style={{ textAlign: 'center' }} margin="none">
                Glemt passord
            </Heading2>
            <Paragraph style={{ textAlign: 'center' }}>
                Skriv inn e-postadressen som du registrerte profilen din på, så
                sender vi deg en lenke der du kan lage et nytt passord.
            </Paragraph>
            <form>
                <GridContainer spacing="small" style={{ padding: '10%' }}>
                    <GridItem small={12}>
                        <InputGroup
                            label="E-post"
                            variant={emailError ? 'error' : undefined}
                            feedback={emailError}
                        >
                            <TextField
                                type="text"
                                value={inputs.email}
                                onChange={handleInputsChange}
                                id="email"
                                prepend={<EmailIcon inline />}
                            />
                        </InputGroup>
                    </GridItem>
                    <GridItem small={12}>
                        <PrimaryButton
                            width="fluid"
                            type="submit"
                            onClick={handleReset}
                        >
                            Send nytt passord
                        </PrimaryButton>
                    </GridItem>
                </GridContainer>
            </form>
        </>
    )
}

export default ResetPassword
