// @ts-nocheck

import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { mockData } from './mockData';

function myFetch<T>(): Promise<T> {
  return new Promise((resolve) => {
    //@ts-ignore
    return setTimeout(() => resolve(mockData), 1000);
  });
}

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
})
export class NetworkComponent implements OnInit {
  ngOnInit() {
    this.draw();
  }

  private async draw(node) {
    const res = await this.getData(node);
    this.drawNodes2(res);
  }

  private async getData(node) {
    const res = await myFetch();
    return res;
  }

  //   private drawNodes(data) {
  //     const onNodeClick = this.onNodeClick;
  //     var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  //       width = 400 - margin.left - margin.right,
  //       height = 400 - margin.top - margin.bottom;

  //     // append the svg object to the body of the page
  //     var svg = d3
  //       .select('#network')
  //       .append('svg')
  //       .attr('width', width + margin.left + margin.right)
  //       .attr('height', height + margin.top + margin.bottom)
  //       .append('g')
  //       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //     // Initialize the links
  //     const link = svg
  //       .selectAll('line')
  //       .data(data.links)
  //       .join('line')
  //       .style('stroke', '#aaa');

  //     // Initialize the nodes
  //     const node = svg
  //       .selectAll('circle')
  //       .data(data.nodes)
  //       .join('circle')
  //       .attr('r', 20)
  //       .style('fill', '#69b3a2')
  //       .on('click', function (e, d) {
  //         onNodeClick(d);
  //       });

  //     // Let's list the force we wanna apply on the network
  //     const simulation = d3
  //       .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
  //       .force(
  //         'link',
  //         d3
  //           .forceLink() // This force provides links between nodes
  //           .id(function (d) {
  //             return d.id;
  //           }) // This provide  the id of a node
  //           .links(data.links) // and this the list of links
  //       )
  //       .force('charge', d3.forceManyBody().strength(-400)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
  //       .force('center', d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
  //       .on('end', ticked);

  //     // This function is run at each iteration of the force algorithm, updating the nodes position.
  //     function ticked() {
  //       link
  //         .attr('x1', function (d) {
  //           return d.source.x;
  //         })
  //         .attr('y1', function (d) {
  //           return d.source.y;
  //         })
  //         .attr('x2', function (d) {
  //           return d.target.x;
  //         })
  //         .attr('y2', function (d) {
  //           return d.target.y;
  //         });

  //       node
  //         .attr('cx', function (d) {
  //           return d.x + 6;
  //         })
  //         .attr('cy', function (d) {
  //           return d.y - 6;
  //         });
  //     }
  //   }

  //   private onNodeClick(node) {
  //     this.draw(node);
  //   }

  private drawNodes2(data) {
    console.log(data);
    // Specify the dimensions of the chart.
    const width = 1000;
    const height = 1000;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map((d) => ({ ...d }));
    const nodes = data.nodes.map((d) => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Create the SVG container.
    const svg = d3
      .select('#network')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll()
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', (d) => color(d.group))
      .on('click', click);

    node.append('title').text((d) => d.id);

    // Add a drag behavior.
    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function click(event, id) {
      console.log(id);
    }
  }
}
