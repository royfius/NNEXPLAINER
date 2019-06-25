import * as d3 from "d3";
import * as marked from "marked";

const MD_SECTION_BREAK_TOKEN = "---BR---";
const MD_SUB_SECTION_BREAK_TOKEN = "---SBR---";


function renderMarkdown(){

    // Render Title
    const title = document.querySelector("#site-title-md");
    d3.text("template/tour/title.md", "text/plain", function(error, titleMarkdown){
      if(titleMarkdown){
        d3.select(title)
          .html(marked(titleMarkdown));
      }
    });
  
    // Render Sections
    const target = document.getElementById("article-text-md");
    d3.text("template/tour/sections.md", "text/plain", function(error, sectionMarkdown){
      if(sectionMarkdown){
        const sections = sectionMarkdown.split(MD_SECTION_BREAK_TOKEN);
        let allSections = [];
  
        sections.forEach(function(sText, s){
  
          // are there any sub-sections?
          const subSections = sText.split(MD_SUB_SECTION_BREAK_TOKEN);
          if(subSections.length){
            // discard first item which is the section itself
            subSections.forEach(function(ssText, i){
              
              allSections.push({
                text: ssText,
                subSection: i > 0,
                id: i == 0 ? `section-${s}` : `section-${s}-${i}`,
                parentId: i > 0 ? `section-${s}` : ""
              });
  
            });
          }else{
            allSections.push({
              text: sText,
              id: `section-${s}`,
              subSection: false,
              parentId: ""
            });
          }
  
        });
  
        const sec = d3.select(target)
          .selectAll("div.l--body")
          .data(allSections)
          .enter()
          .append("div")
          .classed("l--body", true)
          // By default, only show the first section text. Hide its sub-sections as well
          .classed("hidden", (d,i) => i > 0)
          .attr("id", (d,i) => d.id)
          .attr("parent-id", (d) => d.parentId)
          .html((d) => marked(d.text))
          .each(function(d, i){
            const secEl = this as HTMLElement;
  
            // Add event binding to allow toggling the section content
            secEl.firstElementChild.addEventListener("click", () => {
              const el = d3.select(this);
              el.classed('close', !el.classed('close'));
            });
  
          });
        
      }
    });
  
    // Render Links
    d3.text("template/tour/links.md", "text/plain", function(error, linksMarkdown){
      if(linksMarkdown){
        // Polyfill
        if (!Element.prototype.matches) {
          Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                      Element.prototype.webkitMatchesSelector;
        }
        
        if (!Element.prototype.closest) {
          Element.prototype.closest = function(s) {
            var el = this;
        
            do {
              if (el.matches(s)) return el;
              el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
          };
        }
  
        function toggleSectionMenu(clickedMenuItem: HTMLElement){
          const selItem = d3.select(clickedMenuItem),
          sectionNav = d3.select("#section-nav");
  
          // if this item is open, don't do anything
  
          // if this item is closed, closed the currently open one.
          // Open this item and its section
          if(selItem.classed("closed")){
            const lastActiveItem = sectionNav.select(".mdl-list__item.sub-menu:not(.closed)")
              .classed("closed", true);
            // Open the section represented by the item
            //toggleSectionText(lastActiveItem.node() as HTMLElement, true);
          }
          // open the item
          selItem.classed("closed", false);
  
          // Open the section represented by the item
          toggleSectionText(clickedMenuItem, false);
  
        }
  
        function toggleSectionText(sectionMenuItem: HTMLElement, bClosed: boolean){
          const selItem = d3.select(sectionMenuItem);
  
          // hide all sections
          d3.select("#article-text-md").selectAll(".l--body").classed("hidden", true);
  
          selItem.selectAll("a")
          .each(function(){
            const lBody = d3.select(`${this.getAttribute("href")}`).node() as Element;
            d3.select(lBody.closest(".l--body")).classed("hidden", bClosed);
          });
        }
  
        //const sections = linksMarkdown;
        const list = d3.select(target)
          .append("div")
          .classed("l--nav-scroll", true)
          .html(marked(linksMarkdown));
  
        // apply classes
        list.select("ul")
          .attr("id", "section-nav")
          .classed("links mdl-list", true);
  
        //d3.selectAll("#section-nav > li").classed("sub-menu", true);
        
        list.selectAll("li")
          // be default, all sub-menu items are closed
          // Only the details of first section is shown – not including any of its sub-sections
          .classed("mdl-list__item closed", true)
          .classed("sub-menu", function(d){
            //return d3.select(this).select("ul").node() ? true : false;
            return d3.select(this.parentNode).classed("mdl-list");
          })
          .select("a")
          .on("click", function(){
            event.preventDefault();
  
            const el = document.getElementById(this.getAttribute('href').slice(1)),
            parentLi = d3.select(this.parentNode);
  
            if(parentLi.classed("sub-menu")){
              toggleSectionMenu(this.parentNode);
            }
  
            /*
            // If sub-menu is clicked, toggle it and close any open one
            if(parentLi.classed("sub-menu")){
              const bClosed = parentLi.classed("closed");
              parentLi.classed("closed", !bClosed);
              // also toggle the referenced sections from view
              const _sections = parentLi.selectAll("a")
                .each(function(){
                  const lBody = d3.select(`${this.getAttribute("href")}`).node() as Element;
                  d3.select(lBody.closest(".l--body")).classed("hidden", !bClosed);
                });
            }
            */
  
            if(!el){
              return false;
            }
  
            if(el.scrollIntoView){
              el.scrollIntoView({
                behavior: 'smooth', // smooth scroll
                block: 'start' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
              });
            } else {
              const top = el.getBoundingClientRect().top;
  
              window.scrollTo({
                top: top, // scroll so that the element is at the top of the view
                behavior: 'smooth' // smooth scroll
              });
            }
  
          });
  
        // add scroll event
        const offsetTarget = document.getElementById("article-text"),
        btnTour = d3.select('#btn-take-tour');
  
        window.addEventListener('scroll', function(e) {
  
          const bTrue = window.scrollY >= offsetTarget.offsetTop;
        
          list.classed("fixed", bTrue);
          btnTour.classed("fixed", bTrue);
  
        });
          
      }
    });
  }

  renderMarkdown();