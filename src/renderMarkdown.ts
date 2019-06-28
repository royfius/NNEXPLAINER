import * as d3 from "d3";
import * as marked from "marked";

const MD_SECTION_BREAK_TOKEN = "---BR---";
const MD_SUB_SECTION_BREAK_TOKEN = "---SBR---";

const articleTarget = d3.select("#article-text-md");

export function renderMarkdown(sTemplatePath: string){

    // Render Title
    const title = document.querySelector("#site-title-md");
    d3.text(`${sTemplatePath}title.md`, "text/plain", function(error, titleMarkdown){
      if(titleMarkdown){
        d3.select(title)
          .html(marked(titleMarkdown));
      }
    });
  
    // Render Sections
    const navTarget = document.getElementById("article-nav-md");
    d3.text(`${sTemplatePath}sections.md`, "text/plain", function(error, sectionMarkdown){
      if(sectionMarkdown){
        const sections = sectionMarkdown.split(MD_SECTION_BREAK_TOKEN);
        let allSections = [];
  
        sections.forEach(function(sText, s){
  
          // are there any sub-sections?
          const subSections = sText.split(MD_SUB_SECTION_BREAK_TOKEN);

          if(subSections.length){
            // discard first item which is the section itself
            subSections.forEach(function(ssText, i){

              const htmlContent = marked(ssText);

              if(!htmlContent.length){
                return;
              }
              
              allSections.push({
                html: htmlContent,
                subSection: i > 0,
                id: i == 0 ? `section-${s}` : `section-${s}-${i}`,
                parentId: i > 0 ? `section-${s}` : ""
              });
  
            });

          }else{

            const htmlContent = marked(sText);

            if(!htmlContent.length){
              return;
            }

            allSections.push({
              html: htmlContent,
              id: `section-${s}`,
              subSection: false,
              parentId: ""
            });
          }
  
        });
  
        const sec = d3.select(articleTarget.node())
          .selectAll("div.l--body")
          .data(allSections)
          .enter()
          .append("div")
          .classed("l--body", true)
          // By default, only show the first section text. Hide its sub-sections as well
          .classed("hidden", (d,i) => i > 0)
          .attr("id", (d,i) => d.id)
          .attr("parent-id", (d) => d.parentId)
          .html((d) => d.html)
          .each(function(d, i){
            const secEl = this as HTMLElement;
  
            
            // Hide its sub-sections
            /*
            if(i == 0){
              d3.selectAll(`.l--body[parent-id=${this.id}]`)
                .classed("hidden", true);
            }
            */
            // Add event binding to allow toggling the section content
            secEl.firstElementChild.addEventListener("click", () => {
              const el = d3.select(this);
              el.classed('close', !el.classed('close'));
            });
  
          });
        
      }

      // Render Links
      d3.text(`${sTemplatePath}links.md`, "text/plain", function(error, linksMarkdown){

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
            }
            // open the item
            selItem.classed("closed", false);
    
            // Open the section represented by the item
            toggleSectionText(clickedMenuItem, false);
    
          }
    
          function toggleSectionText(sectionMenuItem: HTMLElement, bClosed: boolean){
            const selItem = d3.select(sectionMenuItem);
    
            // hide all sections
            articleTarget.selectAll(".l--body").classed("marked-hidden", true);
    
            selItem.selectAll("a")
            .each(function(){
              const hash = getHash(this);
              if(hash.length > 1){
                const lBody = d3.select(hash).node() as Element;
                if(lBody){
                  d3.select(lBody.closest(".l--body"))
                    .classed("hidden", bClosed)
                    .classed("marked-hidden", false);
                }
              }
            });
          }
    
          //const sections = linksMarkdown;
          const list = d3.select(navTarget)
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
            .classed("mdl-list__item", true)
            .classed("closed", (d, i) => i > 0)
            .classed("sub-menu", function(d){
              //return d3.select(this).select("ul").node() ? true : false;
              return d3.select(this.parentNode).classed("mdl-list");
            })
            .select("a")
            .on("click", function(){
              event.preventDefault();
    
              const el = document.getElementById(getHash(this).slice(1)),
              parentLi = d3.select(this.parentNode);
    
              if(parentLi.classed("sub-menu")){
                toggleSectionMenu(this.parentNode);
              }else if(el){
                // check if the target section is visible, otherwise make it visible
                // Applicable to sub-section links of first section
                d3.select(el.parentNode).classed("hidden", false);
              }
    
              if(!el){
                return false;
              }
    
              // Make new sections visible with transition
              articleTarget.selectAll(".l--body.marked-hidden")
                .transition()
                .duration(0)
                .style("opacity", 0)
                .each("end", function(){
                  d3.select(this)
                    .classed("hidden", true)
                    .classed("marked-hidden", false)
                    .style("opacity", 1);
                });

              // make sure navigation panel height stays within the content
              articleTarget
                .style("min-height", `${Math.max(500, (list.node() as HTMLElement).clientHeight)}px`);

              setTimeout(function(){
                scrollToView(el);
              }, 100);
    
            });
    
          // add scroll event
          const offsetTarget = document.getElementById("article-text"),
          btnTour = d3.select('#btn-take-tour'),
          navTargetCell = navTarget.parentElement;
          
          _padNav();

          window.addEventListener('scroll', function(e) {
    
            const bTrue = window.scrollY >= offsetTarget.offsetTop;
          
            list.classed("fixed mdl-cell--3-col", bTrue);
            btnTour.classed("fixed", bTrue);
    
          });

          window.addEventListener("resize", () => {
            _padNav();
          });
        

          findFloatingNavLinks();

          function _padNav(){
            
            let isFixed = false;

            if(list.classed("fixed")){
              isFixed = true;
              list.classed("fixed mdl-cell--3-col", false);
            }

            const cWidth = (list.node() as HTMLElement).clientWidth,
            gap = navTargetCell.clientWidth - cWidth,
            padding = Math.max(0, gap*.75);

            navTargetCell.style.paddingLeft = `${padding}px`;

            list.classed("fixed mdl-cell--3-col", isFixed);
          }
            
        }
      });

    });
  
    // Render Footer
    const footer = document.querySelector("#footer-md");
    d3.text(`${sTemplatePath}footer.md`, "text/plain", function(error, footerMarkdown){
      if(footerMarkdown){
        d3.select(footer)
          .html(marked(footerMarkdown));
      }
    });
    
}

function getHash(el){
  if(el.hash){
    return el.hash;
  }else{
    return `#${el.href.split('#')[1] || ''}`;
  }
}

function scrollToView(el){

  d3.select('.active-anchor').classed('active-anchor', false);
  
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

  d3.select(el).classed('active-anchor', true);

}

// Checks if any nav links have no associated data sections
function findFloatingNavLinks(){
  // a simple check of existence
  const links = d3.selectAll("#section-nav a"),
  floatingLinks = [];
  
  links.each(function(){
    if(!document.getElementById(getHash(this).slice(1))){
      floatingLinks.push({
        hash: getHash(this),
        text: this.text
      });
    }
  });
  
  if(!floatingLinks.length){
    return;
  }

  alert(floatingLinks.map(function(d){
    return `Title: ${d.text}, Current hash: ${d.hash}`;
  }))
}