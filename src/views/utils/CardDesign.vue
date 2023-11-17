<template>
  <div class="home">
    <div class="nav-box">
      <Navbar :newPage="true" :newUrl="`/utils/color`" pageTitle="好看的设计">
        <template v-slot:custommenu>
          <b-navbar-item>
            <div class="navbar-menu">
              <b-dropdown v-model="navigation" position="is-bottom-left" append-to-body aria-role="menu">
                <template #trigger>
                  <a class="navbar-item" role="button">
                    <b-icon pack="fab" icon="apple"></b-icon>
                    <span>好看UI</span>
                    <b-icon pack="fas" icon="angle-down"></b-icon>
                  </a>
                </template>
                <b-dropdown-item custom aria-role="menuitem">
                  <a href="/utils/design-card">卡片设计</a>
                </b-dropdown-item>
                <b-dropdown-item custom aria-role="menuitem">
                  <a href="/utils/design-btn">Button设计</a>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </b-navbar-item>
        </template>
      </Navbar>
    </div>

    <div class="content-box">
      <div class="container-tmp">
        <div class="card-design-box style1">
          <div class="card">
            <div class="card2">
            </div>
          </div>
        </div>

        <div class="card-design-box style2">
          <div class="flip-card">
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <p class="title">FLIP CARD</p>
                <p>Hover Me</p>
              </div>
              <div class="flip-card-back">
                <p class="title">BACK</p>
                <p>Leave Me</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card-design-box style3">
          <div class="card">
            <div class="card-details">
              <p class="text-title">Card title</p>
              <p class="text-body">Here are the details of the card</p>
            </div>
            <button class="card-button">More info</button>
          </div>
        </div>


        <div class="card-design-box style4">
          <div class="card">
            <p class="title">Standard</p>
            <div class="pricecontainer">
              <p class="price">$2.99</p>
              <p class="pricedescriptor">/month</p>
            </div>
            <p class="includes">This Plan Includes:</p>
            <ul class="benefitlist">
              <li>Awesome Benefits</li>
              <li>10% Discount</li>
            </ul>
            <div class="btncontainer">
              <button>Select This Plan</button>
            </div>
          </div>
        </div>


        <div class="card-design-box style5">
          <div class="card">
            <header class="card-header">
              <p>May 3rd 2023</p>
              <span class="title">A Tale of Two Divs</span>
            </header>
            <div class="card-author">
              <a class="author-avatar" href="#">
                <span>
                </span></a>
              <svg class="half-circle" viewBox="0 0 106 57">
                <path d="M102 4c0 27.1-21.9 49-49 49S4 31.1 4 4"></path>
              </svg>
              <div class="author-name">
                <div class="author-name-prefix">Author</div>
                Folarin Lawal
              </div>
            </div>
            <div class="tags">
              <a href="#">html</a>
              <a href="#">css</a>
              <a href="#">web-dev</a>
            </div>
          </div>
        </div>

        <div class="card-design-box style6">
          <div class="card">
            <div class="card-info">
              <p class="title">New Magic Card</p>
            </div>
          </div>
        </div>

        <div class="card-design-box style7">
          <div class="card">
            <div class="content">
              <svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                   xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                <g>
                  <path style="fill:#D33D3D;" d="M170.207,358.652H49.942c-19.975,0-36.169,16.798-36.169,37.519v6.254
                  c0,20.721,16.194,37.519,36.169,37.519l198.511,14.958L170.207,358.652z"></path>
                  <path style="fill:#D33D3D;" d="M462.058,358.652H342.483l-74.863,89.721l194.438-8.429c19.975,0,36.169-16.798,36.169-37.519
                  v-6.254C498.226,375.45,482.032,358.652,462.058,358.652z"></path>
                </g>
                <g>
                  <path style="fill:#EFAC52;" d="M435.773,231.163h55.511c10.278-1.948,23.917-11.214,17.415-48.429
                  C487.824,84.147,395.409,9.839,284.57,9.839h-57.14c-110.504,0-202.699,73.852-223.946,171.989c0,0-9.843,49.334,27.244,49.334
                  h378.629"></path>
                  <path style="fill:#EFAC52;" d="M512,450.035v-4.588c0-3.04-2.464-5.503-5.503-5.503H277.226c-1.631,0-3.18,0.724-4.224,1.978
                  l-17.355,20.798l-17.049-20.766c-1.045-1.272-2.605-2.01-4.252-2.01H5.503c-3.04,0-5.503,2.463-5.503,5.503v4.658
                  c0.003,0.178,0.013,0.365,0.024,0.499l0.023,0.428l-0.02,0.372c-0.015,0.187-0.024,0.374-0.028,0.63v11.408
                  c0.003,0.181,0.013,0.368,0.024,0.492l0.023,0.438l-0.02,0.368c-0.015,0.187-0.024,0.376-0.028,0.63v13.913
                  c0,12.615,9.895,22.877,22.058,22.877h467.886c12.161,0,22.056-10.263,22.056-22.877v-13.982c-0.002-0.185-0.013-0.37-0.023-0.514
                  l-0.024-0.415l0.021-0.376c0.014-0.187,0.024-0.374,0.026-0.625v-11.406c-0.002-0.187-0.013-0.372-0.023-0.51l-0.024-0.424
                  l0.022-0.381C511.987,450.467,511.998,450.282,512,450.035z"></path>
                </g>
                <g>
                  <path style="fill:#E95353;" d="M84.182,394.634c4.558,0,8.255-3.695,8.255-8.255v-27.727h-16.51v27.727
                  C75.927,390.939,79.622,394.634,84.182,394.634z"></path>
                  <path style="fill:#E95353;" d="M135.83,394.634c4.559,0,8.255-3.695,8.255-8.255v-27.727h-16.51v27.727
                  C127.575,390.939,131.271,394.634,135.83,394.634z"></path>
                  <path style="fill:#E95353;" d="M373.42,394.634c4.559,0,8.255-3.695,8.255-8.255v-27.727h-16.51v27.727
                  C365.165,390.939,368.86,394.634,373.42,394.634z"></path>
                  <path style="fill:#E95353;" d="M416.814,358.652v27.727c0,4.56,3.696,8.255,8.255,8.255c4.56,0,8.255-3.695,8.255-8.255v-27.727
                  H416.814z"></path>
                </g>
                <g>
                  <path style="fill:#7DC44E;" d="M92.552,294.842c-1.849,0-3.71-0.62-5.248-1.888l-35.298-29.116l-35.322,29.095
                  c-3.519,2.898-8.722,2.395-11.62-1.125c-2.9-3.519-2.397-8.722,1.123-11.62l40.574-33.419c3.049-2.513,7.453-2.511,10.501,0.002
                  l40.548,33.446c3.517,2.902,4.015,8.104,1.116,11.622C97.293,293.818,94.932,294.842,92.552,294.842z">
                  </path>
                  <path style="fill:#7DC44E;" d="M94.551,296.426c-1.863,0-3.728-0.63-5.251-1.888l-40.552-33.442
                  c-3.518-2.9-4.016-8.102-1.117-11.62c2.902-3.519,8.104-4.017,11.622-1.118l35.303,29.116l35.318-29.095
                  c3.519-2.898,8.722-2.395,11.622,1.123c2.898,3.519,2.395,8.722-1.125,11.622l-40.569,33.419
                  C98.277,295.798,96.413,296.426,94.551,296.426z"></path>
                  <path style="fill:#7DC44E;" d="M175.675,296.45c-1.863,0-3.728-0.63-5.251-1.888l-40.553-33.444
                  c-3.519-2.9-4.017-8.102-1.118-11.62c2.902-3.519,8.104-4.017,11.622-1.118l35.303,29.114l35.318-29.093
                  c3.518-2.898,8.722-2.397,11.62,1.123c2.899,3.519,2.397,8.722-1.123,11.622l-40.569,33.419
                  C179.399,295.822,177.537,296.45,175.675,296.45z"></path>
                  <path style="fill:#7DC44E;" d="M256.797,296.473c-1.862,0-3.727-0.63-5.251-1.888l-40.555-33.444
                  c-3.517-2.9-4.017-8.102-1.116-11.62c2.9-3.519,8.102-4.017,11.62-1.118l35.305,29.116l35.32-29.097
                  c3.519-2.898,8.722-2.397,11.622,1.123c2.898,3.519,2.395,8.722-1.124,11.622l-40.571,33.421
                  C260.52,295.846,258.659,296.473,256.797,296.473z"></path>
                  <path style="fill:#7DC44E;" d="M338.238,296.497c-1.863,0-3.728-0.63-5.251-1.888l-40.553-33.444
                  c-3.519-2.9-4.017-8.102-1.118-11.62c2.902-3.519,8.104-4.017,11.622-1.118l35.303,29.114l35.318-29.095
                  c3.519-2.898,8.722-2.397,11.621,1.123c2.899,3.519,2.396,8.722-1.123,11.622l-40.569,33.421
                  C341.961,295.87,340.099,296.497,338.238,296.497z"></path>
                  <path style="fill:#7DC44E;" d="M419.36,296.518c-1.863,0-3.728-0.63-5.251-1.888l-40.553-33.444
                  c-3.519-2.9-4.017-8.102-1.118-11.62c2.901-3.519,8.104-4.017,11.622-1.118l35.303,29.116l35.325-29.097
                  c3.519-2.898,8.722-2.397,11.62,1.123c2.9,3.519,2.397,8.722-1.123,11.622l-40.576,33.421
                  C423.083,295.891,421.221,296.518,419.36,296.518z"></path>
                  <path style="fill:#7DC44E;" d="M500.477,296.54c-1.851,0-3.71-0.62-5.25-1.888l-40.545-33.444c-3.517-2.9-4.016-8.104-1.116-11.622
                  c2.901-3.517,8.104-4.015,11.622-1.116l40.546,33.444c3.517,2.902,4.016,8.104,1.116,11.622
                  C505.218,295.516,502.856,296.54,500.477,296.54z"></path>
                </g>
                <path style="fill:#FCAF29;" d="M347.468,356.319c-0.905-1.935-2.849-3.171-4.985-3.171H170.207c-2.129,0-4.065,1.227-4.975,3.149
                c-0.909,1.924-0.628,4.2,0.722,5.846l85.441,104.068c1.04,1.268,2.591,2.005,4.231,2.012c0.008,0,0.015,0,0.022,0
                c1.631,0,3.18-0.724,4.227-1.978l86.835-104.068C348.078,360.537,348.374,358.254,347.468,356.319z">
                </path>
                <path style="opacity:0.15;fill:#202020;enable-background:new    ;" d="M22.564,181.828C43.807,83.691,136.003,9.839,246.507,9.839
                H227.43c-110.504,0-202.699,73.852-223.946,171.989c0,0-9.843,49.334,27.244,49.334h19.077
                C12.718,231.163,22.564,181.828,22.564,181.828z"></path>
                <g style="opacity:0.15;">
                  <path style="fill:#202020;" d="M19.079,479.283V465.37c0.002-0.253,0.013-0.442,0.026-0.63l0.021-0.368l-0.023-0.438
                  c-0.011-0.124-0.022-0.311-0.024-0.492v-11.408c0.002-0.255,0.013-0.442,0.026-0.63l0.021-0.372l-0.023-0.428
                  c-0.011-0.133-0.022-0.32-0.024-0.499v-4.658c0-3.04,2.463-5.503,5.503-5.503H5.503c-3.04,0-5.503,2.463-5.503,5.503v4.658
                  c0.003,0.178,0.013,0.365,0.024,0.499l0.023,0.428l-0.02,0.372c-0.015,0.187-0.024,0.374-0.028,0.63v11.408
                  c0.003,0.181,0.013,0.368,0.024,0.492l0.023,0.438l-0.02,0.368c-0.015,0.187-0.024,0.376-0.028,0.63v13.913
                  c0,12.615,9.895,22.877,22.058,22.877h19.077C28.974,502.161,19.079,491.898,19.079,479.283z"></path>
                </g>
                <g>
                  <path style="opacity:0.15;fill:#202020;enable-background:new    ;" d="M32.85,402.424v-6.254
                  c0-20.721,16.196-37.519,36.171-37.519H49.942c-19.975,0-36.169,16.798-36.169,37.519v6.254c0,20.721,16.194,37.519,36.169,37.519
                  h19.079C49.046,439.944,32.85,423.145,32.85,402.424z"></path>
                  <path style="opacity:0.15;fill:#202020;enable-background:new    ;" d="M185.031,362.143c-1.351-1.644-1.631-3.922-0.722-5.846
                  c0.911-1.922,2.849-3.149,4.976-3.149h-19.079c-2.129,0-4.065,1.227-4.975,3.149c-0.909,1.924-0.628,4.2,0.722,5.846
                  l85.441,104.068c1.04,1.268,2.591,2.005,4.231,2.012c0.008,0,0.015,0,0.022,0c1.631,0,3.18-0.724,4.227-1.978l5.355-6.419
                  L185.031,362.143z"></path>
                </g>
                <path style="fill:#8C5549;"
                      d="M498.226,346.545c0,7.294-5.913,13.208-13.208,13.208H26.982c-7.295,0-13.208-5.914-13.208-13.208
                v-20.662c0-7.294,5.913-13.208,13.208-13.208h458.037c7.295,0,13.208,5.914,13.208,13.208L498.226,346.545L498.226,346.545z"></path>
                <path style="opacity:0.15;fill:#202020;enable-background:new    ;" d="M32.85,345.444v-20.662c0-7.294,5.914-13.208,13.208-13.208
                H26.982c-7.295,0-13.208,5.914-13.208,13.208v20.66c0,7.294,5.913,13.208,13.208,13.208h19.077
                C38.764,358.652,32.85,352.739,32.85,345.444z"></path>
              </svg>
              <div class="description">
                <p class="title">
                  <strong>Spicy Burger</strong>
                </p>
                <p class="info">
                  30 Min | 165 Sell
                </p>
                <p class="price">
                  2.50
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card-design-box style8">
          <div class="card">
            <div class="profileImage">
              <svg viewBox="0 0 128 128">
                <circle r="60" fill="transparent" cy="64" cx="64"></circle>
                <circle r="48" fill="transparent" cy="64" cx="64"></circle>
                <path fill="#191919"
                      d="m64 14a32 32 0 0 1 32 32v41a6 6 0 0 1 -6 6h-52a6 6 0 0 1 -6-6v-41a32 32 0 0 1 32-32z"></path>
                <path opacity="1" fill="#191919"
                      d="m62.73 22h2.54a23.73 23.73 0 0 1 23.73 23.73v42.82a4.45 4.45 0 0 1 -4.45 4.45h-41.1a4.45 4.45 0 0 1 -4.45-4.45v-42.82a23.73 23.73 0 0 1 23.73-23.73z">
                </path>
                <circle r="7" fill="#fbc0aa" cy="65" cx="89"></circle>
                <path fill="#4bc190"
                      d="m64 124a59.67 59.67 0 0 0 34.69-11.06l-3.32-9.3a10 10 0 0 0 -9.37-6.64h-43.95a10 10 0 0 0 -9.42 6.64l-3.32 9.3a59.67 59.67 0 0 0 34.69 11.06z">
                </path>
                <path opacity=".3" fill="#356cb6"
                      d="m45 110 5.55 2.92-2.55 8.92a60.14 60.14 0 0 0 9 1.74v-27.08l-12.38 10.25a2 2 0 0 0 .38 3.25z"></path>
                <path opacity=".3" fill="#356cb6"
                      d="m71 96.5v27.09a60.14 60.14 0 0 0 9-1.74l-2.54-8.93 5.54-2.92a2 2 0 0 0 .41-3.25z"></path>
                <path fill="#fff" d="m57 123.68a58.54 58.54 0 0 0 14 0v-25.68h-14z"></path>
                <path stroke-width="14" stroke-linejoin="round" stroke-linecap="round" stroke="#fbc0aa" fill="none"
                      d="m64 88.75v9.75"></path>
                <circle r="7" fill="#fbc0aa" cy="65" cx="39"></circle>
                <path fill="#ffd8ca" d="m64 91a25 25 0 0 1 -25-25v-16.48a25 25 0 1 1 50 0v16.48a25 25 0 0 1 -25 25z">
                </path>
                <path fill="#191919"
                      d="m91.49 51.12v-4.72c0-14.95-11.71-27.61-26.66-28a27.51 27.51 0 0 0 -28.32 27.42v5.33a2 2 0 0 0 2 2h6.81a8 8 0 0 0 6.5-3.33l4.94-6.88a18.45 18.45 0 0 1 1.37 1.63 22.84 22.84 0 0 0 17.87 8.58h13.45a2 2 0 0 0 2.04-2.03z">
                </path>
                <path style="fill:none;stroke-linecap:round;stroke:#fff;stroke-miterlimit:10;stroke-width:2;opacity:.1"
                      d="m62.76 36.94c4.24 8.74 10.71 10.21 16.09 10.21h5"></path>
                <path style="fill:none;stroke-linecap:round;stroke:#fff;stroke-miterlimit:10;stroke-width:2;opacity:.1"
                      d="m71 35c2.52 5.22 6.39 6.09 9.6 6.09h3"></path>
                <circle r="3" fill="#515570" cy="62.28" cx="76"></circle>
                <circle r="3" fill="#515570" cy="62.28" cx="52"></circle>
                <ellipse ry="2.98" rx="4.58" opacity=".1" fill="#f85565" cy="69.67" cx="50.42"></ellipse>
                <ellipse ry="2.98" rx="4.58" opacity=".1" fill="#f85565" cy="69.67" cx="77.58"></ellipse>
                <g stroke-linejoin="round" stroke-linecap="round" fill="none">
                  <path stroke-width="4" stroke="#fbc0aa" d="m64 67v4"></path>
                  <path stroke-width="2" stroke="#515570" opacity=".2" d="m55 56h-9.25"></path>
                  <path stroke-width="2" stroke="#515570" opacity=".2" d="m82 56h-9.25"></path>
                </g>
                <path opacity=".4" fill="#f85565" d="m64 84c5 0 7-3 7-3h-14s2 3 7 3z"></path>
                <path fill="#f85565"
                      d="m65.07 78.93-.55.55a.73.73 0 0 1 -1 0l-.55-.55c-1.14-1.14-2.93-.93-4.27.47l-1.7 1.6h14l-1.66-1.6c-1.34-1.4-3.13-1.61-4.27-.47z">
                </path>
              </svg>

            </div>
            <div class="textContainer">
              <p class="name">Pepper Potts</p>
              <p class="profile">Profile</p>
            </div>
          </div>
        </div>

        <div class="card-design-box style9">
          <div class="plan-card">
            <h2>Business<span>For business services</span></h2>
            <div class="etiquet-price">
              <p>254.99</p>
              <div></div>
            </div>
            <div class="benefits-list">
              <ul>
                <li>
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M243.8 339.8C232.9 350.7 215.1 350.7 204.2 339.8L140.2 275.8C129.3 264.9 129.3 247.1 140.2 236.2C151.1 225.3 168.9 225.3 179.8 236.2L224 280.4L332.2 172.2C343.1 161.3 360.9 161.3 371.8 172.2C382.7 183.1 382.7 200.9 371.8 211.8L243.8 339.8zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z">
                    </path>
                  </svg>
                  <span>Analysis</span></li>
                <li>
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M243.8 339.8C232.9 350.7 215.1 350.7 204.2 339.8L140.2 275.8C129.3 264.9 129.3 247.1 140.2 236.2C151.1 225.3 168.9 225.3 179.8 236.2L224 280.4L332.2 172.2C343.1 161.3 360.9 161.3 371.8 172.2C382.7 183.1 382.7 200.9 371.8 211.8L243.8 339.8zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z">
                    </path>
                  </svg>
                  <span>Consulting</span></li>
                <li>
                  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M243.8 339.8C232.9 350.7 215.1 350.7 204.2 339.8L140.2 275.8C129.3 264.9 129.3 247.1 140.2 236.2C151.1 225.3 168.9 225.3 179.8 236.2L224 280.4L332.2 172.2C343.1 161.3 360.9 161.3 371.8 172.2C382.7 183.1 382.7 200.9 371.8 211.8L243.8 339.8zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z">
                    </path>
                  </svg>
                  <span>Facilitate</span></li>
              </ul>
            </div>
            <div class="button-get-plan">
              <a href="#">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-rocket">
                  <path
                      d="M156.6 384.9L125.7 353.1C117.2 345.5 114.2 333.1 117.1 321.8C120.1 312.9 124.1 301.3 129.8 288H24C15.38 288 7.414 283.4 3.146 275.9C-1.123 268.4-1.042 259.2 3.357 251.8L55.83 163.3C68.79 141.4 92.33 127.1 117.8 127.1H200C202.4 124 204.8 120.3 207.2 116.7C289.1-4.07 411.1-8.142 483.9 5.275C495.6 7.414 504.6 16.43 506.7 28.06C520.1 100.9 516.1 222.9 395.3 304.8C391.8 307.2 387.1 309.6 384 311.1V394.2C384 419.7 370.6 443.2 348.7 456.2L260.2 508.6C252.8 513 243.6 513.1 236.1 508.9C228.6 504.6 224 496.6 224 488V380.8C209.9 385.6 197.6 389.7 188.3 392.7C177.1 396.3 164.9 393.2 156.6 384.9V384.9zM384 167.1C406.1 167.1 424 150.1 424 127.1C424 105.9 406.1 87.1 384 87.1C361.9 87.1 344 105.9 344 127.1C344 150.1 361.9 167.1 384 167.1z">
                  </path>
                </svg>
                <span>START PROJECT</span>
              </a>
            </div>
          </div>
        </div>

        <div class="card-design-box style10">
          <form class="form">
            <div class="title">OTP</div>
            <div class="title">Verification Code</div>
            <p class="message">We have sent a verification code to your mobile number</p>
            <div class="inputs"><input id="input1" type="text" maxlength="1"> <input id="input2" type="text"
                                                                                     maxlength="1"> <input id="input3"
                                                                                                           type="text"
                                                                                                           maxlength="1">
              <input id="input4" type="text" maxlength="1">
            </div>
            <button class="action">verify me</button>
          </form>
        </div>


        <div class="card-design-box style11">
          <div class="InputContainer">
            <input type="text" name="text" class="input" id="input" placeholder="Search">

            <label for="input" class="labelforsearch">
              <svg viewBox="0 0 512 512" class="searchIcon">
                <path
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z">
                </path>
              </svg>
            </label>
            <div class="border"></div>

            <button class="micButton">
              <svg viewBox="0 0 384 512" class="micIcon">
                <path
                    d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z">
                </path>
              </svg>
            </button>

          </div>
        </div>

        <div class="card-design-box style12">
          <div class="ui-wrapper">
            <input checked="" id="Austria" name="flag" type="radio">
            <input id="Belgium" name="flag" type="radio">
            <input id="Bulgaria" name="flag" type="radio">
            <input id="Croatia" name="flag" type="radio">
            <input id="Cyprus" name="flag" type="radio">
            <input id="Czech" name="flag" type="radio">
            <input id="Denmark" name="flag" type="radio">
            <input id="Estonia" name="flag" type="radio">
            <input id="Finland" name="flag" type="radio">
            <input id="France" name="flag" type="radio">
            <input id="Germany" name="flag" type="radio">
            <input id="Greece" name="flag" type="radio">
            <input id="Hungary" name="flag" type="radio">
            <input id="Iceland" name="flag" type="radio">
            <input id="Ireland" name="flag" type="radio">
            <input id="Italy" name="flag" type="radio">
            <input id="Latvia" name="flag" type="radio">
            <input id="Liechtenstein" name="flag" type="radio">
            <input id="Lithuania" name="flag" type="radio">
            <input id="Luxembourg" name="flag" type="radio">
            <input id="Malta" name="flag" type="radio">
            <input id="Netherlands" name="flag" type="radio">
            <input id="Norway" name="flag" type="radio">
            <input id="Poland" name="flag" type="radio">
            <input id="Portugal" name="flag" type="radio">
            <input id="Romania" name="flag" type="radio">
            <input id="Slovakia" name="flag" type="radio">
            <input id="Slovenia" name="flag" type="radio">
            <input id="Spain" name="flag" type="radio">
            <input id="Sweden" name="flag" type="radio">
            <input class="dropdown-checkbox" name="dropdown" id="dropdown" type="checkbox">
            <label class="dropdown-container" for="dropdown"></label>
            <div class="input-wrapper">
              <legend>
                <label for="phonenumber">
                  Phonenumber*
                </label>
              </legend>
              <div class="textfield">
                <input pattern="\d+" maxlength="11" id="phonenumber" type="text">
                <span class="invalid-msg">This is not a valid phone number</span>
              </div>
            </div>
            <div class="select-wrapper">
              <ul>
                <li class="Austria"><label for="Austria"><span>🇦🇹</span>Austria (+43)</label></li>
                <li class="Belgium"><label for="Belgium"><span>🇧🇪</span>Belgium (+32)</label></li>
                <li class="Bulgaria"><label for="Bulgaria"><span>🇧🇬</span>Bulgaria (+359)</label></li>
                <li class="Croatia"><label for="Croatia"><span>🇭🇷</span>Croatia (+385)</label></li>
                <li class="Cyprus"><label for="Cyprus"><span>🇨🇾</span>Cyprus (+357)</label></li>
                <li class="Czech"><label for="Czech"><span>🇨🇿</span>Czech Republic (+420)</label></li>
                <li class="Denmark"><label for="Denmark"><span>🇩🇰</span>Denmark (+45)</label></li>
                <li class="Estonia"><label for="Estonia"><span>🇪🇪</span>Estonia (+372)</label></li>
                <li class="Finland"><label for="Finland"><span>🇫🇮</span>Finland (+358)</label></li>
                <li class="France"><label for="France"><span>🇫🇷</span>France (+33)</label></li>
                <li class="Germany"><label for="Germany"><span>🇩🇪</span>Germany (+49)</label></li>
                <li class="Greece"><label for="Greece"><span>🇬🇷</span>Greece (+30)</label></li>
                <li class="Hungary"><label for="Hungary"><span>🇭🇺</span>Hungary (+36)</label></li>
                <li class="Iceland"><label for="Iceland"><span>🇮🇸</span>Iceland (+354)</label></li>
                <li class="Ireland"><label for="Ireland"><span>🇮🇪</span>Republic of Ireland (+353)</label></li>
                <li class="Italy"><label for="Italy"><span>🇮🇹</span>Italy (+39)</label></li>
                <li class="Latvia"><label for="Latvia"><span>🇱🇻</span>Latvia (+371)</label></li>
                <li class="Liechtenstein"><label for="Liechtenstein"><span>🇱🇮</span>Liechtenstein (+423)</label></li>
                <li class="Lithuania"><label for="Lithuania"><span>🇱🇹</span>Lithuania (+370)</label></li>
                <li class="Luxembourg"><label for="Luxembourg"><span>🇱🇺</span>Luxembourg (+352)</label></li>
                <li class="Malta"><label for="Malta"><span>🇲🇹</span>Malta (+356)</label></li>
                <li class="Netherlands"><label for="Netherlands"><span>🇳🇱</span>Netherlands (+31)</label></li>
                <li class="Norway"><label for="Norway"><span>🇳🇴</span>Norway (+47)</label></li>
                <li class="Poland"><label for="Poland"><span>🇵🇱</span>Poland (+48)</label></li>
                <li class="Portugal"><label for="Portugal"><span>🇵🇹</span>Portugal (+351)</label></li>
                <li class="Romania"><label for="Romania"><span>🇷🇴</span>Romania (+40)</label></li>
                <li class="Slovakia"><label for="Slovakia"><span>🇸🇰</span>Slovakia (+421)</label></li>
                <li class="Slovenia"><label for="Slovenia"><span>🇸🇮</span>Slovenia (+386)</label></li>
                <li class="Spain"><label for="Spain"><span>🇪🇸</span>Spain (+34)</label></li>
                <li class="Sweden"><label for="Sweden"><span>🇸🇪</span>Sweden (+46)</label></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card-design-box style13">
          <div class="centralize">
            <div>
              <button>
                <span><svg viewBox="0 0 467 512.22" clip-rule="evenodd" fill-rule="evenodd"
                           image-rendering="optimizeQuality" text-rendering="geometricPrecision"
                           shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg" fill="#0E418F"
                           height="12"
                           width="12">
                    <path
                        d="M131.07 372.11c.37 1 .57 2.08.57 3.2 0 1.13-.2 2.21-.57 3.21v75.91c0 10.74 4.41 20.53 11.5 27.62s16.87 11.49 27.62 11.49h239.02c10.75 0 20.53-4.4 27.62-11.49s11.49-16.88 11.49-27.62V152.42c0-10.55-4.21-20.15-11.02-27.18l-.47-.43c-7.09-7.09-16.87-11.5-27.62-11.5H170.19c-10.75 0-20.53 4.41-27.62 11.5s-11.5 16.87-11.5 27.61v219.69zm-18.67 12.54H57.23c-15.82 0-30.1-6.58-40.45-17.11C6.41 356.97 0 342.4 0 326.52V57.79c0-15.86 6.5-30.3 16.97-40.78l.04-.04C27.51 6.49 41.94 0 57.79 0h243.63c15.87 0 30.3 6.51 40.77 16.98l.03.03c10.48 10.48 16.99 24.93 16.99 40.78v36.85h50c15.9 0 30.36 6.5 40.82 16.96l.54.58c10.15 10.44 16.43 24.66 16.43 40.24v302.01c0 15.9-6.5 30.36-16.96 40.82-10.47 10.47-24.93 16.97-40.83 16.97H170.19c-15.9 0-30.35-6.5-40.82-16.97-10.47-10.46-16.97-24.92-16.97-40.82v-69.78zM340.54 94.64V57.79c0-10.74-4.41-20.53-11.5-27.63-7.09-7.08-16.86-11.48-27.62-11.48H57.79c-10.78 0-20.56 4.38-27.62 11.45l-.04.04c-7.06 7.06-11.45 16.84-11.45 27.62v268.73c0 10.86 4.34 20.79 11.38 27.97 6.95 7.07 16.54 11.49 27.17 11.49h55.17V152.42c0-15.9 6.5-30.35 16.97-40.82 10.47-10.47 24.92-16.96 40.82-16.96h170.35z"
                        fill-rule="nonzero"></path>
                  </svg> Copy link</span>
                <span>Copied</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="backtop">
      <back-top color="#409EFF" :size="1.1" :slow="10"></back-top>
    </div>
    <div id="footer">
      <Footer/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Navbar from '@/components/Navbar.vue'
import BackTop from '@mlqt/vue-back-top'
import Footer from '@/components/Footer.vue'

Vue.use(BackTop)
export default {
  name: 'Color',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {}
  },
  methods: {
    onCopySuccess() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `${this.showMoney}`,
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
    handleCopyText(str) {
      this.$copyText(str).then(() => {
        let tmpStr = str.substring(0, 40)
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制成功：${tmpStr} ...`,
          type: 'is-success',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      }, (e) => {
        this.$buefy.snackbar.open({
          duration: 3000,
          message: `复制失败：${e.message}`,
          type: 'is-danger',
          position: 'is-bottom-right',
          actionText: 'Msg'
        })
      })
    },
    jumpSoftwareDetail(item) {
      this.$router.push({
        path: `/utils/software/${item.id}`
      })
    },
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
}

.content-box {
  background-color: #333333;
  display: flex;
  justify-content: center;

  .container-tmp {
    display: flex;
    width: 100%;
    max-width: 1334px;
    padding: 60px 0 400px 0;
    flex-wrap: wrap;
    gap: 20px;

    .card-design-box {
      width: 250px;
    }

    .style1 {
      .card {
        width: 190px;
        height: 254px;
        background-image: linear-gradient(163deg, #00ff75 0%, #3700ff 100%);
        border-radius: 20px;
        transition: all .3s;

        .card2 {
          width: 190px;
          height: 254px;
          background-color: #1a1a1a;
          transition: all .2s;

          &:hover {
            transform: scale(0.98);
            border-radius: 20px;
          }
        }

        &:hover {
          box-shadow: 0px 0px 30px 1px rgba(0, 255, 117, 0.30);
        }
      }
    }

    .style2 {
      .flip-card {
        background-color: transparent;
        width: 190px;
        height: 254px;
        perspective: 1000px;
        font-family: sans-serif;

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s;
          transform-style: preserve-3d;

          .flip-card-front,
          .flip-card-back {
            box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
            position: absolute;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border: 1px solid coral;
            border-radius: 1rem;
          }
        }
      }

      .title {
        font-size: 1.5em;
        font-weight: 900;
        text-align: center;
        margin: 0;
      }


      .flip-card:hover .flip-card-inner {
        transform: rotateY(180deg);
      }

      .flip-card-front,
      .flip-card-back {
        box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border: 1px solid coral;
        border-radius: 1rem;
      }

      .flip-card-front {
        background: linear-gradient(120deg, bisque 60%, rgb(255, 231, 222) 88%,
        rgb(255, 211, 195) 40%, rgba(255, 127, 80, 0.603) 48%);
        color: coral;
      }

      .flip-card-back {
        background: linear-gradient(120deg, rgb(255, 174, 145) 30%, coral 88%,
        bisque 40%, rgb(255, 185, 160) 78%);
        color: white;
        transform: rotateY(180deg);
      }
    }

    .style3 {
      .card {
        width: 190px;
        height: 254px;
        border-radius: 20px;
        background: #f5f5f5;
        position: relative;
        padding: 1.8rem;
        border: 2px solid #c3c6ce;
        transition: 0.5s ease-out;
        overflow: visible;
      }

      .card-details {
        color: black;
        height: 100%;
        gap: .5em;
        display: grid;
        place-content: center;
      }

      .card-button {
        transform: translate(-50%, 125%);
        width: 60%;
        border-radius: 1rem;
        border: none;
        background-color: #008bf8;
        color: #fff;
        font-size: 1rem;
        padding: .5rem 1rem;
        position: absolute;
        left: 50%;
        bottom: 0;
        opacity: 0;
        transition: 0.3s ease-out;
      }

      .text-body {
        color: rgb(134, 134, 134);
      }

      /*Text*/

      .text-title {
        font-size: 1.5em;
        font-weight: bold;
      }

      /*Hover*/

      .card:hover {
        border-color: #008bf8;
        box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.25);
      }

      .card:hover .card-button {
        transform: translate(-50%, 50%);
        opacity: 1;
      }
    }

    .style4 {
      .card {
        width: 190px;
        height: 254px;
        background: rgb(45, 45, 45);
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
        transition-duration: 0.5s;
        border: 1px solid #ffffff;
        border-radius: 10px;
      }

      .title {
        text-align: center;
        margin-top: 0.5em;
        font-weight: bold;
        font-size: x-large;
        color: rgb(200, 200, 200);
      }

      .pricecontainer {
        width: 100%;
        margin-top: 0.7em;
        background-color: rgb(30, 30, 30);
        box-shadow: inset 0px 0px 2em rgba(0, 0, 0, 0.3);
      }

      .price {
        text-align: center;
        color: rgb(180, 180, 180);
        font-size: x-large;
        font-weight: bold;
        padding: 0.75em 0 0 0;
      }

      .pricedescriptor {
        text-align: center;
        color: rgb(118, 118, 118);
        font-size: medium;
        padding: 0 0 1em 0;
      }

      .includes {
        text-align: center;
        color: rgb(110, 110, 110);
        margin-top: 0.6em;
        font-size: small;
        font-weight: bold;
      }

      .benefitlist li {
        color: rgb(150, 150, 150);
        font-size: small;
        text-align: center;
      }

      .benefitlist li:nth-child(1) {
        margin-top: 0.4em;
      }

      .btncontainer {
        text-align: center;
      }

      .btncontainer button {
        margin-top: 1em;
        padding: 0.5em 0.8em 0.5em 0.8em;
        border-style: none;
        border-radius: 1000000px;
        color: rgb(239, 239, 239);
        font-weight: bold;
        background-image: linear-gradient(45deg, #fe4fe1 0%, #3f00fe 100%);
        transition: box-shadow 0.15s ease-in-out;
      }

      .btncontainer button:hover {
        box-shadow: inset 0px 0px 5px rgb(0, 0, 0);
        transition: box-shadow 0.15s ease-in-out;
      }
    }

    .style5 {
      .card {
        display: flex;
        position: relative;
        flex-direction: column;
        height: 350px;
        width: 190px;
        min-width: 250px;
        padding: 1rem;
        border-radius: 16px;
        background: #17141d;
        box-shadow: -1rem 0 3rem #00000067;
        transition: .2s;
        font-family: 'Inter', sans-serif;
      }

      .card:hover {
        transform: translateY(-0.4rem);
      }

      .card-author {
        position: relative;
        display: grid;
        grid-template-columns: 75px 1fr;
        align-items: center;
        margin: 3rem 0 0;
      }

      .author-name {
        color: #7a7a8c;
      }

      .author-name-prefix {
        color: #e52e71;
        font-weight: 600;
      }

      .author-avatar span {
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f2f2f2;
        margin: 16px 10px;
      }

      .half-circle {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 48px;
        fill: none;
        stroke: #ff8a00;
        stroke-width: 8;
        stroke-linecap: round;
      }

      .card-header {
        margin-bottom: auto;
        color: #7a7a8c;
      }

      .card-header p {
        font-size: 14px;
        margin: 0 0 1rem;
        color: #7a7a8c;
      }

      .card-header .title {
        font-size: 25px;
        margin: .25rem 0 auto;
        cursor: pointer;
        font-family: 'Arial Black', sans-serif;
      }

      .card-header .title:hover {
        background: linear-gradient(90deg, #ff8a00, #e52e71);
        text-shadow: none;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .tags {
        margin: 1rem 0 2rem;
        padding: .5rem 0 1rem;
        line-height: 2;
        margin-bottom: 0;
      }

      .tags a {
        font-style: normal;
        font-weight: 700;
        color: #7a7a8c;
        text-transform: uppercase;
        font-size: .66rem;
        border: 3px solid #28242f;
        border-radius: 2rem;
        padding: .2rem .85rem .25rem;
        position: relative;
      }

      .tags a:hover {
        background: linear-gradient(90deg, #ff8a00, #e52e71);
        text-shadow: none;
        -webkit-text-fill-color: transparent;
        -webkit-background-clip: text;
        -webkit-box-decoration-break: clone;
        box-decoration-break: clone;
        background-clip: text;
        border-color: white;
      }
    }

    .style6 {
      .card {
        --background: linear-gradient(to left, #a5c1e7 0%, #9b59b6 100%);
        width: 200px;
        height: 270px;
        padding: 10px;
        border-radius: 1rem;
        overflow: visible;
        background: #a5c1e7;
        background: var(--background);
        position: relative;
        z-index: 1;
      }

      .card::after {
        position: absolute;
        content: "";
        top: 40px;
        left: 0;
        right: 0;
        z-index: -1;
        height: 100%;
        width: 100%;
        transform: scale(0.85);
        filter: blur(30px);
        background: #a5c1e7;
        background: var(--background);
        transition: opacity 0.5s;
      }

      .card-info {
        --color: #ffffff;
        background: var(--color);
        color: var(--color);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: visible;
        border-radius: 0.6rem;
      }

      .card .title {
        font-weight: bold;
        letter-spacing: 0.2em;
        text-align: center;
      }

      /*Hover*/

      .card:hover::after {
        opacity: 0;
      }

      .card:hover .card-info {
        color: #a5c1e7;
        transition: color 1s;
      }

    }

    .style7 {
      .card {
        width: 190px;
        height: 254px;
        overflow: visible;
        cursor: pointer;
        position: relative;
      }

      .card::before,
      .content {
        border-radius: 5px;
        box-shadow: 0px 0px 5px 1px #00000022;
        transition: transform 300ms, box-shadow 200ms;
      }

      .card::before {
        position: absolute;
        content: ' ';
        display: block;
        width: 100%;
        height: 100%;
        background-color: #ee9933;
        transform: rotateZ(5deg);
      }

      .info {
        color: #00000066;
      }

      .price::before {
        content: '$';
      }

      .price {
        font-weight: bold;
        color: #ee9933;
      }

      .card .content {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: white;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: rotateZ(-5deg);
      }

      .content .img {
        width: 150px;
        height: fit-content;
      }

      .card:hover::before,
      .card:hover .content {
        transform: rotateZ(0deg);
      }

      .card:active::before,
      .card:active .content {
        box-shadow: none;
      }
    }

    .style8 {
      .card {
        width: 210px;
        height: 280px;
        background: rgb(39, 39, 39);
        border-radius: 12px;
        box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.123);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        transition-duration: .5s;
      }

      .profileImage {
        background: linear-gradient(to right, rgb(54, 54, 54), rgb(32, 32, 32));
        margin-top: 20px;
        width: 170px;
        height: 170px;
        border-radius: 50%;
        box-shadow: 5px 10px 20px rgba(0, 0, 0, 0.329);
      }

      .textContainer {
        width: 100%;
        text-align: left;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .name {
        font-size: 0.9em;
        font-weight: 600;
        color: white;
        letter-spacing: 0.5px;
      }

      .profile {
        font-size: 0.84em;
        color: rgb(194, 194, 194);
        letter-spacing: 0.2px;
      }

      .card:hover {
        background-color: rgb(43, 43, 43);
        transition-duration: .5s;
      }
    }

    .style9 {
      .plan-card {
        background: #fff;
        width: 15rem;
        padding-left: 2rem;
        padding-right: 2rem;
        padding-top: 10px;
        padding-bottom: 20px;
        border-radius: 10px;
        border-bottom: 4px solid #000446;
        box-shadow: 0 6px 30px rgba(207, 212, 222, 0.3);
        font-family: "Poppins", sans-serif;
      }

      .plan-card h2 {
        margin-bottom: 15px;
        font-size: 27px;
        font-weight: 600;
      }

      .plan-card h2 span {
        display: block;
        margin-top: -4px;
        color: #4d4d4d;
        font-size: 12px;
        font-weight: 400;
      }

      .etiquet-price {
        position: relative;
        background: #fdbd4a;
        width: 14.46rem;
        margin-left: -0.65rem;
        padding: .2rem 1.2rem;
        border-radius: 5px 0 0 5px;
      }

      .etiquet-price p {
        margin: 0;
        padding-top: .4rem;
        display: flex;
        font-size: 1.9rem;
        font-weight: 500;
      }

      .etiquet-price p:before {
        content: "$";
        margin-right: 5px;
        font-size: 15px;
        font-weight: 300;
      }

      .etiquet-price p:after {
        content: "/ handle";
        margin-left: 5px;
        font-size: 15px;
        font-weight: 300;
      }

      .etiquet-price div {
        position: absolute;
        bottom: -23px;
        right: 0px;
        width: 0;
        height: 0;
        border-top: 13px solid #c58102;
        border-bottom: 10px solid transparent;
        border-right: 13px solid transparent;
        z-index: -6;
      }

      .benefits-list {
        margin-top: 16px;
      }

      .benefits-list ul {
        padding: 0;
        font-size: 14px;
      }

      .benefits-list ul li {
        color: #4d4d4d;
        list-style: none;
        margin-bottom: .2rem;
        display: flex;
        align-items: center;
        gap: .5rem;
      }

      .benefits-list ul li svg {
        width: .9rem;
        fill: currentColor;
      }

      .benefits-list ul li span {
        font-weight: 300;
      }

      .button-get-plan {
        display: flex;
        justify-content: center;
        margin-top: 1.2rem;
      }

      .button-get-plan a {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #000446;
        color: #fff;
        padding: 10px 15px;
        border-radius: 5px;
        text-decoration: none;
        font-size: .8rem;
        letter-spacing: .05rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .button-get-plan a:hover {
        transform: translateY(-3%);
        box-shadow: 0 3px 10px rgba(207, 212, 222, 0.9);
      }

      .button-get-plan .svg-rocket {
        margin-right: 10px;
        width: .9rem;
        fill: currentColor;
      }
    }

    .style10 {
      .form {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-around;
        width: 300px;
        background-color: white;
        border-radius: 12px;
        padding: 20px;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        color: black
      }

      .message {
        color: #a3a3a3;
        font-size: 14px;
        margin-top: 4px;
        text-align: center
      }

      .inputs {
        margin-top: 10px
      }

      .inputs input {
        width: 32px;
        height: 32px;
        text-align: center;
        border: none;
        border-bottom: 1.5px solid #d2d2d2;
        margin: 0 10px;
      }

      .inputs input:focus {
        border-bottom: 1.5px solid royalblue;
        outline: none;
      }

      .action {
        margin-top: 24px;
        padding: 12px 16px;
        border-radius: 8px;
        border: none;
        background-color: royalblue;
        color: white;
        cursor: pointer;
        align-self: end;
      }
    }

    .style11 {
      .InputContainer {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgb(255, 255, 255);
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        padding-left: 15px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.075);
      }

      .input {
        width: 170px;
        height: 100%;
        border: none;
        outline: none;
        font-size: 0.9em;
        caret-color: rgb(255, 81, 0);
      }

      .labelforsearch {
        cursor: text;
        padding: 0px 12px;
      }

      .searchIcon {
        width: 13px;
      }

      .border {
        height: 40%;
        width: 1.3px;
        background-color: rgb(223, 223, 223);
      }

      .micIcon {
        width: 12px;
      }

      .micButton {
        padding: 0px 15px 0px 12px;
        border: none;
        background-color: transparent;
        height: 40px;
        cursor: pointer;
        transition-duration: .3s;
      }

      .searchIcon path {
        fill: rgb(114, 114, 114);
      }

      .micIcon path {
        fill: rgb(255, 81, 0);
      }

      .micButton:hover {
        background-color: rgb(255, 230, 230);
        transition-duration: .3s;
      }
    }

    .style12 {
      .ui-wrapper {
        --width: 250px;
        --height: 50px;
        --background: #fff;
        --text-color: rgb(73, 73, 73);
        --border-color: rgb(185, 184, 184);
        --border-focus-color: rgb(0, 110, 255);
        --shadow-color: rgba(34, 60, 80, 0.2);
        --shadow-focus-color: rgba(0, 110, 255, 0.2);
        --dropdown-button-color: #e6e6e6;
        --dropdown-button-hover-color: #dad9d9;
      }

      .ui-wrapper *,
      .ui-wrapper *::before,
      .ui-wrapper *::after {
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        font-family: sans-serif;
        color: var(--text-color);
      }

      .ui-wrapper {
        width: var(--width);
        height: var(--height);
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        border-radius: 10px;
        position: relative;
        border: 1px solid var(--border-color);
        background-color: var(--background);
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        padding-right: 10px;
        -webkit-box-shadow: 0px 2px 5px 0px var(--shadow-color);
        box-shadow: 0px 2px 5px 0px var(--shadow-color);
        -webkit-transition: .4s;
        -o-transition: .4s;
        transition: .4s;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .ui-wrapper > input {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
        width: 0;
        height: 0;
        opacity: 0;
        position: absolute;
        left: 9999px;
      }

      .dropdown-container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        padding: 0 10px;
        cursor: pointer;
        border-radius: 9px 0 0 9px;
        background-color: var(--dropdown-button-color);
      }

      .dropdown-container::before {
        content: "🇦🇹";
        font-size: 20px;
        background: none !important;
      }

      .dropdown-container::after {
        content: "";
        background-image: url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjNDk0OTQ5IiB3aWR0aD0iNzAwcHQiIGhlaWdodD0iNzAwcHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDcwMCA3MDAiCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxwYXRoCiAgICAgICAgZD0ibTM4MC4zOSA0ODQuNzkgMzA3LjA0LTMwNS45OWMxNi43NjYtMTcuODEyIDE2Ljc2Ni00NS4wNTkgMC02MS44MjgtMTYuNzY2LTE2Ljc2Ni00NS4wNTktMTYuNzY2LTYxLjgyOCAwbC0yNzUuNiAyNzUuNi0yNzUuNi0yNzUuNmMtMTcuODEyLTE2Ljc2Ni00NS4wNTktMTYuNzY2LTYxLjgyOCAwLTE2Ljc2NiAxNi43NjYtMTYuNzY2IDQ0LjAxMiAwIDYxLjgyOGwzMDUuOTkgMzA1Ljk5YzE3LjgxMiAxNi43NjYgNDUuMDU5IDE2Ljc2NiA2MS44MjggMHoiCiAgICAgICAgZmlsbC1ydWxlPSJjdXJyZW50Q29sb3IiIC8+Cjwvc3ZnPg==");
        width: 12px;
        height: 12px;
        background-position: center;
        background-size: cover;
        margin-left: 5px;
        -webkit-transition: .2s;
        -o-transition: .2s;
        transition: .2s;
      }

      .select-wrapper {
        width: var(--width);
        position: absolute;
        top: calc(var(--height) + 20px);
        left: 0;
        opacity: 0;
        visibility: hidden;
        -webkit-transition: .2s;
        -o-transition: .2s;
        transition: .2s;
      }

      .select-wrapper ul {
        width: 100%;
        background-color: white;
        border-radius: 10px;
        padding: 10px;
        margin: 0;
        list-style: none;
        height: 300px;
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow-y: auto;
        white-space: nowrap;
      }

      .select-wrapper ul li {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        padding: 5px;
        border-radius: 5px;
      }

      .select-wrapper ul li label {
        width: 100%;
      }

      .select-wrapper ul li,
      .select-wrapper ul li * {
        cursor: pointer;
      }

      .select-wrapper ul li:hover {
        background: lightgray;
      }

      .select-wrapper ul li span {
        display: inline-block;
        margin-right: 15px;
      }

      .input-wrapper {
        width: 100%;
        padding-left: 10px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        row-gap: 2px;
      }

      .input-wrapper legend {
        font-size: 11px;
      }

      .input-wrapper .textfield {
        width: 100%;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
      }

      .input-wrapper .textfield::before {
        content: "+31";
        margin-right: 5px;
        white-space: nowrap;
      }

      .input-wrapper .textfield input {
        width: 100%;
        font-size: 16px;
        outline: none;
        border: none;
        background: none;
      }

      .invalid-msg {
        font-size: 12px;
        position: absolute;
        color: red;
        top: 115%;
        left: 0;
        opacity: 0;
        visibility: hidden;
        -webkit-transition: .2s;
        -o-transition: .2s;
        transition: .2s;
      }

      /* actions */

      #phonenumber:invalid + .invalid-msg {
        top: 110%;
        opacity: 1;
        visibility: visible;
      }

      .ui-wrapper:focus-within {
        border-color: var(--border-focus-color);
        -webkit-box-shadow: 0px 2px 5px 0px var(--shadow-focus-color);
        box-shadow: 0px 2px 5px 0px var(--shadow-focus-color);
      }

      .dropdown-container:hover {
        background-color: var(--dropdown-button-hover-color);
      }

      .dropdown-checkbox:checked ~ .select-wrapper {
        top: calc(var(--height) + 5px);
        opacity: 1;
        visibility: visible;
      }

      .dropdown-checkbox:checked + .dropdown-container::after {
        rotate: 180deg;
        translate: 0 -2px;
      }

      .ui-wrapper input#Austria:checked ~ .dropdown-container::before,
      .ui-wrapper input#Austria:checked ~ .select-wrapper li.Austria {
        content: "🇦🇹";
        background-color: lightgray;
      }

      .ui-wrapper input#Belgium:checked ~ .dropdown-container::before,
      .ui-wrapper input#Belgium:checked ~ .select-wrapper li.Belgium {
        content: "🇧🇪";
        background-color: lightgray;
      }

      .ui-wrapper input#Bulgaria:checked ~ .dropdown-container::before,
      .ui-wrapper input#Bulgaria:checked ~ .select-wrapper li.Bulgaria {
        content: "🇧🇬";
        background-color: lightgray;
      }

      .ui-wrapper input#Croatia:checked ~ .dropdown-container::before,
      .ui-wrapper input#Croatia:checked ~ .select-wrapper li.Croatia {
        content: "🇭🇷";
        background-color: lightgray;
      }

      .ui-wrapper input#Cyprus:checked ~ .dropdown-container::before,
      .ui-wrapper input#Cyprus:checked ~ .select-wrapper li.Cyprus {
        content: "🇨🇾";
        background-color: lightgray;
      }

      .ui-wrapper input#Czech:checked ~ .dropdown-container::before,
      .ui-wrapper input#Czech:checked ~ .select-wrapper li.Czech {
        content: "🇨🇿";
        background-color: lightgray;
      }

      .ui-wrapper input#Denmark:checked ~ .dropdown-container::before,
      .ui-wrapper input#Denmark:checked ~ .select-wrapper li.Denmark {
        content: "🇩🇰";
        background-color: lightgray;
      }

      .ui-wrapper input#Estonia:checked ~ .dropdown-container::before,
      .ui-wrapper input#Estonia:checked ~ .select-wrapper li.Estonia {
        content: "🇪🇪";
        background-color: lightgray;
      }

      .ui-wrapper input#Finland:checked ~ .dropdown-container::before,
      .ui-wrapper input#Finland:checked ~ .select-wrapper li.Finland {
        content: "🇫🇮";
        background-color: lightgray;
      }

      .ui-wrapper input#France:checked ~ .dropdown-container::before,
      .ui-wrapper input#France:checked ~ .select-wrapper li.France {
        content: "🇫🇷";
        background-color: lightgray;
      }

      .ui-wrapper input#Germany:checked ~ .dropdown-container::before,
      .ui-wrapper input#Germany:checked ~ .select-wrapper li.Germany {
        content: "🇩🇪";
        background-color: lightgray;
      }

      .ui-wrapper input#Greece:checked ~ .dropdown-container::before,
      .ui-wrapper input#Greece:checked ~ .select-wrapper li.Greece {
        content: "🇬🇷";
        background-color: lightgray;
      }

      .ui-wrapper input#Hungary:checked ~ .dropdown-container::before,
      .ui-wrapper input#Hungary:checked ~ .select-wrapper li.Hungary {
        content: "🇭🇺";
        background-color: lightgray;
      }

      .ui-wrapper input#Iceland:checked ~ .dropdown-container::before,
      .ui-wrapper input#Iceland:checked ~ .select-wrapper li.Iceland {
        content: "🇮🇸";
        background-color: lightgray;
      }

      .ui-wrapper input#Ireland:checked ~ .dropdown-container::before,
      .ui-wrapper input#Ireland:checked ~ .select-wrapper li.Ireland {
        content: "🇮🇪";
        background-color: lightgray;
      }

      .ui-wrapper input#Italy:checked ~ .dropdown-container::before,
      .ui-wrapper input#Italy:checked ~ .select-wrapper li.Italy {
        content: "🇮🇹";
        background-color: lightgray;
      }

      .ui-wrapper input#Latvia:checked ~ .dropdown-container::before,
      .ui-wrapper input#Latvia:checked ~ .select-wrapper li.Latvia {
        content: "🇱🇻";
        background-color: lightgray;
      }

      .ui-wrapper input#Liechtenstein:checked ~ .dropdown-container::before,
      .ui-wrapper input#Liechtenstein:checked ~ .select-wrapper li.Liechtenstein {
        content: "🇱🇮";
        background-color: lightgray;
      }

      .ui-wrapper input#Lithuania:checked ~ .dropdown-container::before,
      .ui-wrapper input#Lithuania:checked ~ .select-wrapper li.Lithuania {
        content: "🇱🇹";
        background-color: lightgray;
      }

      .ui-wrapper input#Luxembourg:checked ~ .dropdown-container::before,
      .ui-wrapper input#Luxembourg:checked ~ .select-wrapper li.Luxembourg {
        content: "🇱🇺";
        background-color: lightgray;
      }

      .ui-wrapper input#Malta:checked ~ .dropdown-container::before,
      .ui-wrapper input#Malta:checked ~ .select-wrapper li.Malta {
        content: "🇲🇹";
        background-color: lightgray;
      }

      .ui-wrapper input#Netherlands:checked ~ .dropdown-container::before,
      .ui-wrapper input#Netherlands:checked ~ .select-wrapper li.Netherlands {
        content: "🇳🇱";
        background-color: lightgray;
      }

      .ui-wrapper input#Norway:checked ~ .dropdown-container::before,
      .ui-wrapper input#Norway:checked ~ .select-wrapper li.Norway {
        content: "🇳🇴";
        background-color: lightgray;
      }

      .ui-wrapper input#Poland:checked ~ .dropdown-container::before,
      .ui-wrapper input#Poland:checked ~ .select-wrapper li.Poland {
        content: "🇵🇱";
        background-color: lightgray;
      }

      .ui-wrapper input#Portugal:checked ~ .dropdown-container::before,
      .ui-wrapper input#Portugal:checked ~ .select-wrapper li.Portugal {
        content: "🇵🇹";
        background-color: lightgray;
      }

      .ui-wrapper input#Romania:checked ~ .dropdown-container::before,
      .ui-wrapper input#Romania:checked ~ .select-wrapper li.Romania {
        content: "🇷🇴";
        background-color: lightgray;
      }

      .ui-wrapper input#Slovakia:checked ~ .dropdown-container::before,
      .ui-wrapper input#Slovakia:checked ~ .select-wrapper li.Slovakia {
        content: "🇸🇰";
        background-color: lightgray;
      }

      .ui-wrapper input#Slovenia:checked ~ .dropdown-container::before,
      .ui-wrapper input#Slovenia:checked ~ .select-wrapper li.Slovenia {
        content: "🇸🇮";
        background-color: lightgray;
      }

      .ui-wrapper input#Spain:checked ~ .dropdown-container::before,
      .ui-wrapper input#Spain:checked ~ .select-wrapper li.Spain {
        content: "🇪🇸";
        background-color: lightgray;
      }

      .ui-wrapper input#Sweden:checked ~ .dropdown-container::before,
      .ui-wrapper input#Sweden:checked ~ .select-wrapper li.Sweden {
        content: "🇸🇪";
        background-color: lightgray;
      }

      .ui-wrapper input#Austria:checked ~ .input-wrapper .textfield::before {
        content: "+43";
      }

      .ui-wrapper input#Belgium:checked ~ .input-wrapper .textfield::before {
        content: "+32";
      }

      .ui-wrapper input#Bulgaria:checked ~ .input-wrapper .textfield::before {
        content: "+359";
      }

      .ui-wrapper input#Croatia:checked ~ .input-wrapper .textfield::before {
        content: "+385";
      }

      .ui-wrapper input#Cyprus:checked ~ .input-wrapper .textfield::before {
        content: "+357";
      }

      .ui-wrapper input#Czech:checked ~ .input-wrapper .textfield::before {
        content: "+420";
      }

      .ui-wrapper input#Denmark:checked ~ .input-wrapper .textfield::before {
        content: "+45";
      }

      .ui-wrapper input#Estonia:checked ~ .input-wrapper .textfield::before {
        content: "+372";
      }

      .ui-wrapper input#Finland:checked ~ .input-wrapper .textfield::before {
        content: "+358";
      }

      .ui-wrapper input#France:checked ~ .input-wrapper .textfield::before {
        content: "+33";
      }

      .ui-wrapper input#Germany:checked ~ .input-wrapper .textfield::before {
        content: "+49";
      }

      .ui-wrapper input#Greece:checked ~ .input-wrapper .textfield::before {
        content: "+30";
      }

      .ui-wrapper input#Hungary:checked ~ .input-wrapper .textfield::before {
        content: "+36";
      }

      .ui-wrapper input#Iceland:checked ~ .input-wrapper .textfield::before {
        content: "+354";
      }

      .ui-wrapper input#Ireland:checked ~ .input-wrapper .textfield::before {
        content: "+353";
      }

      .ui-wrapper input#Italy:checked ~ .input-wrapper .textfield::before {
        content: "+39";
      }

      .ui-wrapper input#Latvia:checked ~ .input-wrapper .textfield::before {
        content: "+371";
      }

      .ui-wrapper input#Liechtenstein:checked ~ .input-wrapper .textfield::before {
        content: "+423";
      }

      .ui-wrapper input#Lithuania:checked ~ .input-wrapper .textfield::before {
        content: "+370";
      }

      .ui-wrapper input#Luxembourg:checked ~ .input-wrapper .textfield::before {
        content: "+352";
      }

      .ui-wrapper input#Malta:checked ~ .input-wrapper .textfield::before {
        content: "+356";
      }

      .ui-wrapper input#Netherlands:checked ~ .input-wrapper .textfield::before {
        content: "+31";
      }

      .ui-wrapper input#Norway:checked ~ .input-wrapper .textfield::before {
        content: "+47";
      }

      .ui-wrapper input#Poland:checked ~ .input-wrapper .textfield::before {
        content: "+48";
      }

      .ui-wrapper input#Portugal:checked ~ .input-wrapper .textfield::before {
        content: "+351";
      }

      .ui-wrapper input#Romania:checked ~ .input-wrapper .textfield::before {
        content: "+40";
      }

      .ui-wrapper input#Slovakia:checked ~ .input-wrapper .textfield::before {
        content: "+421";
      }

      .ui-wrapper input#Slovenia:checked ~ .input-wrapper .textfield::before {
        content: "+386";
      }

      .ui-wrapper input#Spain:checked ~ .input-wrapper .textfield::before {
        content: "+34";
      }

      .ui-wrapper input#Sweden:checked ~ .input-wrapper .textfield::before {
        content: "+46";
      }
    }

    .style13 {
      button {
        background-color: #F2F7FA;
        width: 100px;
        height: 30px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        overflow: hidden;
        transition-duration: 700ms;
      }

      button span:first-child {
        color: #0E418F;
        position: absolute;
        transform: translate(-50%, -50%)
      }

      button span:last-child {
        position: absolute;
        color: #B5CCF3;
        opacity: 0;
        transform: translateY(100%) translateX(-50%);
        height: 14px;
        line-height: 13px;
      }

      button:focus {
        background-color: #0E418F;
        width: 120px;
        height: 40px;
        transition-delay: 100ms;
        transition-duration: 500ms;
      }

      button:focus span:first-child {
        color: #B5CCF3;
        transform: translateX(-50%) translateY(-150%);
        opacity: 0;
        transition-duration: 500ms;
      }

      button:focus span:last-child {
        transform: translateX(-50%) translateY(-50%);
        opacity: 1;
        transition-delay: 300ms;
        transition-duration: 500ms;
      }

      button:focus:end {
        background-color: #FFFFFF;
        width: 120px;
        height: 40px;
        transition-duration: 900ms;
      }

      .centralize {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .description {
        margin-top: 10px;
        color: #B5CCF3;
      }
    }
  }
}</style>
  