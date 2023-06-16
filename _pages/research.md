---
layout: page
permalink: /research/
title: Research
description:
nav: true
nav_order: 1
horizontal: true
---

The cells in our bodies use large biomolecules such as DNA, RNA, and proteins to store and process information. My research program in biomedical engineering is focused on developing new tools to precisely measure the biomolecules in our bodies and even deliver new biomolecules into our cells, towards the overarching goal of improving human health and longevity. My core expertise is at the interface between micro-/nanoscale systems and biological systems. This rich and growing field of study inherits from many foundational disciplines across the physical sciences, life sciences, and engineering.

A major thrust of my current research is investigating ways to improve the safety, efficiency, and accessibility of therapeutic gene editing. I am particularly interested in technologies for editing large numbers of cells outside of the body, which could have signficant clinical impacts across cancer therapy, global health, regenerative medicine, autoimmune disease, and metabolic disorders.


## Current Projects
<div class="projects">
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  {%- for project in sorted_projects -%}
    {%- if project.current -%}
      <div class="container">
        <div class="row">
          <div class="col-3">
            {%- include figure.html path=project.img alt="project thumbnail" -%}
          </div>
          <div class="col-9">
            <h3>{{project.title}}</h3>
            <p>{{project.content}}</p>
          </div>
        </div>
      </div>
    {%- endif -%}   
  {%- endfor -%}
</div>













## Current Projects

<div class="projects">
<!-- Display projects without categories -->
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-1">
    {%- for project in sorted_projects -%}
      {%- if project.current -%}
        {% include projects_horizontal.html %}
      {%- endif -%}   
    {%- endfor -%}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for project in sorted_projects -%}
      {%- if project.current -%}
        {% include projects.html %}
      {%- endif -%}   
    {%- endfor -%}
  </div>
  {%- endif -%}
</div>

## Prior Projects

<div class="projects">
<!-- Display projects without categories -->
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  <!-- Generate cards for each project -->
  {% if page.horizontal -%}
  <div class="container">
    <div class="row row-cols-1">
    {%- for project in sorted_projects -%}
      {%- unless project.current -%}
        {% include projects_horizontal.html %}
      {%- endunless -%}   
    {%- endfor -%}
    </div>
  </div>
  {%- else -%}
  <div class="grid">
    {%- for project in sorted_projects -%}
      {%- unless project.current -%}
        {% include projects.html %}
      {%- endunless -%}   
    {%- endfor -%}
  </div>
  {%- endif -%}
</div>