import React, { useState } from "react";
import { Link } from "react-router-dom";

const menus = [
  {
    id: 1,
    title: "Home",
    link: "/",
  },
  {
    id: 2,
    title: "Articles",
    link: "/articles",
  },
  {
    id: 3,
    title: "Interviews",
    link: "/interview/the-painter",
    submenu: [
      {
        id: 1,
        title: "The Politician",
        link: "/interview/the-politician", // The Critics
      },
      {
        id: 2,
        title: "The Essayist & The Critic",
        link: "/interview/the-essayist-the-critic", // The Essayist & The Critic
      },
      {
        id: 3,
        title: "The Painter",
        link: "/interview/the-painter", // The Painter
      },
    ],
  },
  {
    id: 4,
    title: "Encounters & dialogues",
    link: "/encounter-and-dialogue",
  },
  {
    id: 5,
    title: "Beyond Politics",
    link: "/beyondPolitics",
    submenu: [
      {
        id: 1,
        title: "Paintings",
        link: "/beyondPolitics/the-politician/1",
      },
      {
        id: 2,
        title: "Exhibitions & Moments",
        link: "/beyondPolitics/the-essayist-the-critic/1",
      },
    ],
  },
  {
    id: 6,
    title: "My Story",
    submenu: [
      {
        id: 1,
        title: "Prologue",
        link: "/story/1",
      },
      {
        id: 2,
        title: "I was not born a rebel",
        link: "/story/2",
      },
      {
        id: 3,
        title: "The First Battle",
        link: "/story/3",
      },
      {
        id: 4,
        title: "Back to Syria",
        link: "/story/4",
      },
      {
        id: 5,
        title: "Painting",
        link: "/story/5",
      },
      {
        id: 6,
        title: "A Life of Art",
        link: "/story/6",
      },
      {
        id: 7,
        title: "The Turning Point",
        link: "/story/7",
      },
      {
        id: 8,
        title: "Political Fight: A Struggle",
        link: "/story/8",
      },
      {
        id: 9,
        title: "Looking Back",
        link: "/story/9",
      },
      {
        id: 10,
        title: "AD-HOC Organisation",
        link: "/story/10",
      },
      {
        id: 11,
        title: "Loss, Grief, and...",
        link: "/story/11",
      },
      {
        id: 12,
        title: "The Contradiction That...",
        link: "/story/12",
      },
      {
        id: 13,
        title: "The Absurdity of Emotions",
        link: "/story/13",
      },
      {
        id: 14,
        title: "A Life Without Meaning",
        link: "/story/14",
      },
      {
        id: 15,
        title: "Moving Forward",
        link: "/story/15",
      },
    ],
  },
  {
    id: 7,
    title: "Gallery",
    submenu: [
      {
        id: 1,
        title: "In the Arena",
        link: "/gallery/in-the-arena/1",
      },
      {
        id: 2,
        title: "My Four-Pawed Companions",
        subsubmenu: [
          {
            id: 1,
            title: "Nestor",
            link: "/gallery/my-four-pawed-companions/1",
          },
          {
            id: 2,
            title: "Bianca & Roxy",
            link: "/gallery/my-four-pawed-companions/2",
          },
          {
            id: 3,
            title: "Socrates",
            link: "/gallery/my-four-pawed-companions/3",
          },
          {
            id: 4,
            title: "Aristotle",
            link: "/gallery/my-four-pawed-companions/4",
          },
          {
            id: 5,
            title: "Nietzsche",
            link: "/gallery/my-four-pawed-companions/5",
          },
          {
            id: 6,
            title: "Damascius",
            link: "/gallery/my-four-pawed-companions/6",
          },
          {
            id: 7,
            title: "The Litter of Nine",
            link: "/gallery/my-four-pawed-companions/7",
          },
          {
            id: 8,
            title: "Countess Bonnie",
            link: "/gallery/my-four-pawed-companions/8",
          },
          {
            id: 9,
            title: "Tequila—the resident",
            link: "/gallery/my-four-pawed-companions/9",
          },
          {
            id: 10,
            title: "Ah, Agathe. Marvellous character",
            link: "/gallery/my-four-pawed-companions/10",
          },
          {
            id: 11,
            title: "Grace—the household’s",
            link: "/gallery/my-four-pawed-companions/11",
          },
          {
            id: 12,
            title: "Vodka, strategist—the war planner",
            link: "/gallery/my-four-pawed-companions/12",
          },
          {
            id: 13,
            title: "Whitty—the last male",
            link: "/gallery/my-four-pawed-companions/13",
          },
          {
            id: 14,
            title: "Winston and Solaia",
            link: "/gallery/my-four-pawed-companions/14",
          },
          {
            id: 15,
            title: "Clyde",
            link: "/gallery/my-four-pawed-companions/15",
          },
          {
            id: 16,
            title: "Greco and Bobbie",
            link: "/gallery/my-four-pawed-companions/16",
          },
        ],
      },
      {
        id: 3,
        title: "Through My Eyes",
        subsubmenu: [
          {
            id: 1,
            title: "In Their Gaze",
            link: "/gallery/through-my-eyes/1",
          },
          {
            id: 2,
            title: "Art in Motion",
            link: "/gallery/through-my-eyes/2",
          },
          {
            id: 3,
            title: "Ruins That Speak",
            link: "/gallery/through-my-eyes/3",
          },
          {
            id: 4,
            title: "Testaments in Stone",
            link: "/gallery/through-my-eyes/4",
          },
          {
            id: 5,
            title: "The Pulse of the Earth",
            link: "/gallery/through-my-eyes/5",
          },
          {
            id: 6,
            title: "Traces of Atrocity",
            link: "/gallery/through-my-eyes/6",
          },
        ],
      },
    ],
  },
];

const Topbar = ({ openMainId, setOpenMainId, openSubId, setOpenSubId }) => {
  const toggleMain = (id) => {
    setOpenMainId(openMainId === id ? null : id);
    // Close the sub submenu whenever main menu changes
    setOpenSubId(null);
  };

  const toggleSub = (id) => {
    setOpenSubId(openSubId === id ? null : id);
  };

  const ClickHandler = () => {
    window.scrollTo(10, 0);
  };

  return (
    <nav>
      <ul className="navbar-nav">
        {menus.map((menu) => (
          <li key={menu.id} className={`menu-item ${openMainId === menu.id ? "open" : ""}`}>
            {menu.submenu ? (
              <>
                <span
                  onClick={() => toggleMain(menu.id)}
                  className="menu-link"
                  style={{ cursor: "pointer" }}
                >
                  {menu.title}{" "}
                  <i className={`fa fa-angle-${openMainId === menu.id ? "up" : "down"}`} />
                </span>
                {openMainId === menu.id && (
                  <ul className="sub-menu">
                    {menu.submenu.map((sub) => (
                      <li key={sub.id} className="submenu-item">
                        {sub.subsubmenu ? (
                          <>
                            <span onClick={() => toggleSub(sub.id)} style={{ cursor: "pointer" }}>
                              {sub.title}{" "}
                              <i
                                className={`fa fa-angle-${openSubId === sub.id ? "up" : "down"}`}
                              />
                            </span>
                            {openSubId === sub.id && (
                              <ul className="sub-sub-menu">
                                {sub.subsubmenu.map((subsub) => (
                                  <li key={subsub.id}>
                                    <Link to={subsub.link} onClick={ClickHandler}>
                                      {subsub.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <Link to={sub.link} onClick={ClickHandler}>
                            {sub.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link to={menu.link} onClick={ClickHandler}>
                {menu.title}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <style>{`
        .menu-item > .sub-menu,
        .submenu-item > .sub-sub-menu {
          margin-left: 20px;
          list-style: none;
          padding-left: 0;
        }
        .menu-item > .sub-menu {
          border-left: 1px solid #ccc;
          padding-left: 10px;
        }
        .sub-sub-menu {
          border-left: 1px dotted #aaa;
          padding-left: 10px;
        }
      `}</style>
    </nav>
  );
};

export default Topbar;
