import React, { useState, useEffect } from 'react'

import { HeaderCell, Table, TableHead, TableRow } from '@entur/table'

import {
    getIcon,
    unique,
    getTransportIconIdentifier,
    isNotNullOrUndefined,
    getIconColorType,
} from '../../../utils'
import {
    StopPlaceWithDepartures,
    LineData,
    IconColorType,
} from '../../../types'

import Tile from '../components/Tile'
import TileRows from '../components/TileRows'

import './styles.scss'
import { useSettingsContext } from '../../../settings'
import { WalkInfo } from '../../../logic/useWalkInfo'

function getTransportHeaderIcons(
    departures: LineData[],
    iconColorType: IconColorType,
): JSX.Element[] {
    const transportModes = unique(
        departures.map(({ type, subType }) => ({ type, subType })),
        (a, b) =>
            getTransportIconIdentifier(a.type, a.subType) ===
            getTransportIconIdentifier(b.type, b.subType),
    )

    const transportIcons = transportModes.map(({ type, subType }) => ({
        icon: getIcon(type, iconColorType, subType),
    }))

    return transportIcons.map(({ icon }) => icon).filter(isNotNullOrUndefined)
}

function getColumnSizes(
    isMobile: boolean,
    hideTracks: boolean | undefined,
    hideSituations: boolean | undefined,
) {
    const getColSize = (desktopWidth: string, mobileWidth: string) =>
        !isMobile ? { width: desktopWidth } : { width: mobileWidth }

    return {
        iconCol: getColSize('14%', '14%'),
        lineCol:
            !hideTracks && !hideSituations
                ? getColSize('44%', '38%')
                : !hideTracks || !hideSituations
                ? getColSize('54%', '49%')
                : getColSize('64%', '61%'),
        departureCol: getColSize('20%', '20%'),
        trackCol: !hideTracks ? getColSize('10%', '11%') : null,
        situationCol: !hideSituations ? getColSize('10%', '11%') : null,
    }
}

const DepartureTile = ({
    stopPlaceWithDepartures,
    walkInfo,
    isMobile = false,
    numberOfTileRows = 7,
}: Props): JSX.Element => {
    const { departures, name } = stopPlaceWithDepartures
    const [settings] = useSettingsContext()
    const { hideSituations, hideTracks, hideWalkInfo } = settings || {}
    const [iconColorType, setIconColorType] = useState<IconColorType>(
        IconColorType.CONTRAST,
    )

    const limitedDepartures = departures.slice(0, numberOfTileRows)
    const visibleDepartures = isMobile ? limitedDepartures : departures

    useEffect(() => {
        if (settings) {
            setIconColorType(getIconColorType(settings.theme))
        }
    }, [settings])

    const columnSizes = getColumnSizes(isMobile, hideTracks, hideSituations)

    return (
        <Tile
            title={name}
            icons={getTransportHeaderIcons(departures, iconColorType)}
            walkInfo={!hideWalkInfo ? walkInfo : undefined}
        >
            <Table spacing="small" fixed>
                <TableHead>
                    <TableRow className="tableRow">
                        <HeaderCell style={columnSizes.iconCol}></HeaderCell>
                        <HeaderCell style={columnSizes.lineCol}>
                            Linje
                        </HeaderCell>
                        <HeaderCell style={columnSizes.departureCol}>
                            Avgang
                        </HeaderCell>
                        {!hideTracks ? (
                            <HeaderCell style={columnSizes.trackCol}>
                                Spor
                            </HeaderCell>
                        ) : null}
                        {!hideSituations ? (
                            <HeaderCell style={columnSizes.situationCol}>
                                Avvik
                            </HeaderCell>
                        ) : null}
                    </TableRow>
                </TableHead>
                <TileRows
                    visibleDepartures={visibleDepartures}
                    hideSituations={hideSituations}
                    hideTracks={hideTracks}
                    iconColorType={iconColorType}
                />
            </Table>
        </Tile>
    )
}

interface Props {
    stopPlaceWithDepartures: StopPlaceWithDepartures
    walkInfo?: WalkInfo
    isMobile?: boolean
    numberOfTileRows?: number
}

export default DepartureTile
