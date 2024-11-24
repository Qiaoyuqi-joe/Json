<template>
    <div id="app">
      <svg ref="svg" width="800" height="600"></svg>
    </div>
  </template>
  
  <script>
  import * as d3 from 'd3';
  
  export default {
    name: 'App',
    data() {
      return {
        nodes: [],
        links: [],
        nodeRadius: 10, // 每个节点的半径
      };
    },
    mounted() {
      this.generateDummyData(); // 生成假数据
      this.drawGraph(); // 绘制图形
    },
    methods: {
      generateDummyData() {
        this.nodes = [
          { id: 'Alice', age: 30, city: 'New York' },
          { id: 'Bob', age: 25, city: 'New York' },
          { id: 'Charlie', age: 35, city: 'Los Angeles' },
          { id: 'David', age: 40, city: 'Los Angeles' },
          { id: 'Eve', age: 28, city: 'Chicago' },
          { id: 'Frank', age: 32, city: 'Chicago' },
          { id: 'Grace', age: 29, city: 'Houston' },
          { id: 'Heidi', age: 34, city: 'Houston' },
          { id: 'Ivan', age: 27, city: 'Phoenix' },
          { id: 'Judy', age: 31, city: 'Phoenix' },
          { id: 'Karl', age: 26, city: 'New York' },
          { id: 'Laura', age: 33, city: 'Los Angeles' },
          { id: 'Mike', age: 37, city: 'Chicago' },
          { id: 'Nina', age: 29, city: 'Houston' },
          { id: 'Oscar', age: 41, city: 'Phoenix' },
          { id: 'Paul', age: 36, city: 'New York' },
          { id: 'Quinn', age: 24, city: 'Los Angeles' },
          { id: 'Rachel', age: 30, city: 'Chicago' },
          { id: 'Steve', age: 38, city: 'Houston' },
          { id: 'Tina', age: 26, city: 'Phoenix' },
          { id: 'Uma', age: 29, city: 'Chicago' },
        ];
  
        this.links = [
          { source: 'Alice', target: 'Bob', weight: 5 },
          { source: 'Alice', target: 'Paul', weight: 3 },
          { source: 'Bob', target: 'Judy', weight: 4 },
          { source: 'Charlie', target: 'David', weight: 2 },
          { source: 'David', target: 'Laura', weight: 3 },
          { source: 'Eve', target: 'Frank', weight: 4 },
          { source: 'Eve', target: 'Rachel', weight: 5 },
          { source: 'Grace', target: 'Heidi', weight: 2 },
          { source: 'Ivan', target: 'Judy', weight: 3 },
          { source: 'Karl', target: 'Alice', weight: 4 },
          { source: 'Laura', target: 'Charlie', weight: 2 },
          { source: 'Mike', target: 'Eve', weight: 3 },
          { source: 'Nina', target: 'Grace', weight: 4 },
          { source: 'Oscar', target: 'Ivan', weight: 5 },
          { source: 'Paul', target: 'Nina', weight: 2 },
          { source: 'Quinn', target: 'David', weight: 3 },
          { source: 'Rachel', target: 'Steve', weight: 4 },
          { source: 'Steve', target: 'Uma', weight: 5 },
          { source: 'Tina', target: 'Frank', weight: 2 },
          { source: 'Uma', target: 'Heidi', weight: 3 },
          { source: 'Alice', target: 'Oscar', weight: 4 },
        ];
      },
      drawGraph() {
        const svg = d3.select(this.$refs.svg);
        svg.selectAll("*").remove(); // 清空 SVG 元素
  
        const width = +svg.attr("width");
        const height = +svg.attr("height");
  
        const cityCenters = {
          'New York': [150, 100],
          'Los Angeles': [450, 100],
          'Chicago': [150, 350],
          'Houston': [450, 350],
          'Phoenix': [300, 500],
        };
  
        // 设置节点的初始位置并确保聚集
        this.nodes.forEach(node => {
          const center = cityCenters[node.city];
          if (center) {
            node.x = center[0] + (Math.random() - 0.5) * 30; // 增加随机偏移
            node.y = center[1] + (Math.random() - 0.5) * 30; // 增加随机偏移
          }
        });
  
        const simulation = d3.forceSimulation(this.nodes)
          .force("link", d3.forceLink().id(d => d.id).distance(80)) // 增加连接距离
          .force("charge", d3.forceManyBody().strength(-120)) // 增加负值吸引力
          .force("center", d3.forceCenter(width / 2, height / 2))
          .force("x", d3.forceX().x(d => cityCenters[d.city] ? cityCenters[d.city][0] : width / 2).strength(1))
          .force("y", d3.forceY().y(d => cityCenters[d.city] ? cityCenters[d.city][1] : height / 2).strength(1));
  
        const link = svg.append("g")
          .attr("class", "links")
          .selectAll("g")
          .data(this.links)
          .enter().append("g");
  
        link.append("line")
          .attr("stroke", "#4A90E2")
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2);
  
        link.append("text")
          .attr("dy", -3)
          .attr("dx", 5)
          .attr("font-size", "10px")
          .text(d => d.weight);
  
        const nodeGroup = svg.append("g")
          .attr("class", "nodes");
  
        const node = nodeGroup.selectAll("circle")
          .data(this.nodes)
          .enter().append("circle")
          .attr("r", this.nodeRadius)
          .attr("fill", d => d.city === 'New York' ? '#E57373' :
                            d.city === 'Los Angeles' ? '#64B5F6' :
                            d.city === 'Chicago' ? '#FFD54F' :
                            d.city === 'Houston' ? '#81C784' :
                            '#FFB74D')
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .call(d3.drag()
            .on("start", this.dragstarted)
            .on("drag", this.dragged)
            .on("end", this.dragended));
  
        const text = nodeGroup.selectAll("text")
          .data(this.nodes)
          .enter().append("text")
          .attr("dy", ".35em")
          .attr("font-size", "12px")
          .attr("fill", "#333")
          .text(d => d.id);
  
        this.drawCityCircles(svg, cityCenters);
  
        simulation
          .nodes(this.nodes)
          .on("tick", () => {
            this.ticked(link, node, text);
            this.updateCityCircles(svg);
          });
  
        simulation.force("link")
          .links(this.links);
      },
      drawCityCircles(svg, cityCenters) {
        this.cityCircles = {};
  
        Object.keys(cityCenters).forEach(city => {
          const center = cityCenters[city];
          this.cityCircles[city] = svg.append("circle")
            .attr("cx", center[0])
            .attr("cy", center[1])
            .attr("r", this.nodeRadius * 4)
            .attr("fill", "none")
            .attr("stroke", "#FFCA28")
            .attr("stroke-width", 3)
            .attr("opacity", 0.5);
        });
      },
      updateCityCircles(svg) {
        Object.keys(this.cityCircles).forEach(city => {
          const nodesInCity = this.nodes.filter(node => node.city === city);
          if (nodesInCity.length > 0) {
            const avgX = d3.mean(nodesInCity, d => d.x);
            const avgY = d3.mean(nodesInCity, d => d.y);
            const maxDistance = d3.max(nodesInCity, d => Math.sqrt((d.x - avgX) ** 2 + (d.y - avgY) ** 2));
            this.cityCircles[city]
              .attr("cx", avgX)
              .attr("cy", avgY)
              .attr("r", maxDistance + this.nodeRadius * 2);
          }
        });
      },
      ticked(link, node, text) {
        link.selectAll("line")
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
        link.selectAll("text")
          .attr("x", d => (d.source.x + d.target.x) / 2)
          .attr("y", d => (d.source.y + d.target.y) / 2); // 将文本放置在边的中点
  
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
  
        text
          .attr("x", d => d.x)
          .attr("y", d => d.y); // 将文本放置在节点中心
      },
      dragstarted(event, d) {
        if (!event.active) d3.forceSimulation().alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      },
      dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      },
      dragended(event, d) {
        if (!event.active) d3.forceSimulation().alphaTarget(0);
        d.fx = null;
        d.fy = null;
      },
    },
  };
  </script>
  
  <style>
  .node {
    fill: steelblue;
  }
  .link {
    stroke: #4A90E2; /* 更新边的颜色 */
    stroke-opacity: 0.6;
    stroke-width: 2; /* 边的宽度 */
  }
  </style>
  