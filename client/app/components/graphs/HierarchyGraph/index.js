import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale'
import { tree as d3Tree, hierarchy as d3Hierarchy } from 'd3-hierarchy'

import createZoom from '../zoom'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

import {
    colorNode,
    colorActiveNode,
} from '../colorNode'

class Node extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { node, onClick } = this.props
        const transform = `translate(${node.y}, ${node.x})`;

        return (
            <g id={`node-${node.data.id}`} className="node node-inside" transform={transform} onClick={onClick}>
                <circle
                    className="nodeCircle"
                    r={node.radius}
                    fill={ node.children ? "lightsteelblue" : "#fff" }
                />
                <text
                    className="nodeText"
                    x={node.children ? -10 : 10}
                    textAnchor={ node.children ? "end" : "start" }
                >{node.data.name}</text>
            </g>
        )
    }
}

class HierarchyLink extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        return (
            <path 
                className="hierarchy-link"
                d={ 
                    [
                        "M",
                        link.y,
                        link.x,
                        "C",
                        (link.y + link.parent.y) / 2,
                        link.x,
                        (link.y + link.parent.y) / 2,
                        link.parent.x,
                        link.parent.y,
                        link.parent.x
                    ].join(' ')
                }
            />
        )
    }
}

class Link extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        const startingPoint = `M ${link.source.y}, ${link.source.x}`

        const path = link.source.depth === link.target.depth ? 
            [ startingPoint,
                'A',
                (link.source.x - link.target.x) / 2,
                // 50,
                (link.source.x - link.target.x) / 2,
                0,
                0,
                link.source.x < link.target.x ? 1 : 0,
                link.target.y,
                link.target.x
            ].join(' ')
            :
            // [
            //     startingPoint,
            //     'L',
            //     link.target.y,
            //     link.target.x
            // ].join(' ')
            [
                startingPoint,
                "C",
                (link.source.y + link.target.y) / 2,
                link.source.x,
                (link.source.y + link.target.y) / 2,
                link.target.x,
                link.target.y,
                link.target.x
            ].join(' ')

        return (
            <path 
                className="link"
                d={ path }
            />
        )
    }
}

class NodeGraph extends React.Component {

    constructor(props) {
        super(props)

        this.tree = d3Tree()
    }

    render() {
        const {
            treeData,
            nodes,
            links,
            hierarchyLinks,
            isLoading,
            showLinks,
        } = this.props

        let nodesById = {}
        nodes.forEach(node => {
            nodesById[node.data.id] = node
        })

        links.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        // this.tree = this.tree.size([newHeight, WIDTH]);
        this.tree = this.tree.nodeSize([25, 100]);

        // Compute the new tree layout.

        // const maxLabelLength = 50;
        // // Set widths between levels based on maxLabelLength.
        // nodes.forEach(function(d) {
        //     d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // });

        const nodeElements = nodes.map(node => (
            <Node 
                key={node.id}
                node={node}
                onClick={this.props.onNodeClick}
            />
        ))

        // const hierarchyLinkGroupElements = _(hierarchyLinks)
        //     .groupBy((link) => link.parent.data.id)
        //     .map((linkArray) => {
        //         console.log(linkArray)
        //         return (
        //             <g>
        //                 {
        //                 linkArray.map(link => (
        //                     <HierarchyLink
        //                         key={link.id}
        //                         link={link}
        //                     />
        //                 ))
        //                 }
        //             </g>
        //         )
        //     })
        //     .value()


        const hierarchyLinkElements = hierarchyLinks.map(link => (
            <HierarchyLink
                key={link.id}
                link={link}
            />
        ))

        const linkElements = links
            .filter(link => (
                !(
                    link.source.data.id === ((link.target.parent) && link.target.parent.data.id)
                    ||
                    link.target.data.id === ((link.source.parent) && link.source.parent.data.id)
                )
            ))
            .map(link => (
            <Link
                key={link.id}
                link={link}
            />
        ))

        return (
            <g className="hierarchy-graph">
                { hierarchyLinkElements }
                { showLinks ? linkElements : null }
                { nodeElements }
                { isLoading ? null : null }
            </g>
        )
    }
}

export default withRouter(NodeGraph)
