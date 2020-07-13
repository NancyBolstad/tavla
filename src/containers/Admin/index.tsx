import React, { useCallback, useState } from 'react'

import { Button } from '@entur/button'
import { Contrast } from '@entur/layout'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@entur/tab'
import { ClosedLockIcon } from '@entur/icons'

import { getDocumentId } from '../../utils'
import { useFirebaseAuthentication } from '../../auth'

import './styles.scss'
import AdminHeader from './AdminHeader'
import LogoTab from './LogoTab'
import EditTab from './EditTab'

const AdminPage = ({ history }: Props): JSX.Element => {
    const documentId = getDocumentId()
    const user = useFirebaseAuthentication()

    const [currentIndex, setCurrentIndex] = useState<number>(0)

    const goToDash = useCallback(() => {
        if (documentId) {
            history.push(window.location.pathname.replace('admin', 't'))
        }
        history.push(window.location.pathname.replace('admin', 'dashboard'))
    }, [history, documentId])

    const lockIcon = !(user && !user.isAnonymous) && <ClosedLockIcon />

    return (
        <Contrast className="admin">
            <AdminHeader goBackToDashboard={goToDash} />
            <Tabs
                index={currentIndex}
                onChange={(newIndex) => setCurrentIndex(newIndex)}
            >
                <TabList>
                    <Tab>Rediger innhold</Tab>
                    <Tab>Last opp logo {lockIcon}</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <EditTab />
                    </TabPanel>
                    <TabPanel>
                        <LogoTab
                            tabIndex={currentIndex}
                            setTabIndex={() => setCurrentIndex(0)}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
            <Button
                className="admin__submit-button"
                variant="primary"
                onClick={goToDash}
            >
                Se avgangstavla
            </Button>
        </Contrast>
    )
}

interface Props {
    history: any
}

export default AdminPage
