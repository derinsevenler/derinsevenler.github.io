---
layout: page
title: Publications
---
<ol>
    {% for pub in site.data.pubs %}
    <li>
        <h2> pub.title </h2>
        pub.authors
        <i>pub.journal</i>
        <img src="assets/images/{{pub.img}}">
    </li>
</ol>