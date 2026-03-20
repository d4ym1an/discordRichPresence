        const DISCORD_USER_ID = "YOUR_DISCORD_USER_ID_HERE"; // Replace with your Discord user ID
        const LANYARD_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
        const REFRESH_MS = 20000;
        const STATUS_TEXT = {
            online: "Online",
            idle: "Idle",
            dnd: "Do Not Disturb",
            offline: "Offline"
        };

        const statusLabelEl = document.getElementById("discord-status-label");
        const platformEl = document.getElementById("discord-platform");
        const dotEl = document.getElementById("discord-dot");
        const avatarEl = document.getElementById("discord-avatar");
        const nameEl = document.getElementById("discord-name");
        const handleEl = document.getElementById("discord-handle");
        const activitiesListEl = document.getElementById("discord-activities-list");

        function durationToText(ms) {
            const totalSeconds = Math.max(0, Math.floor(ms / 1000));
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (hours > 0) return `${hours}h ${minutes}m`;
            if (minutes > 0) return `${minutes}m ${seconds}s`;
            return `${seconds}s`;
        }

        function timestampToText(timestamps) {
            if (!timestamps) return "";
            const now = Date.now();

            if (timestamps.start && timestamps.end) {
                if (timestamps.end > now) {
                    return `Ends in ${durationToText(timestamps.end - now)}`;
                }
                return "Session ending soon";
            }

            if (timestamps.start) {
                return `Elapsed ${durationToText(now - timestamps.start)}`;
            }

            return "";
        }

        function activityTypeToText(type) {
            switch (type) {
                case 0: return "Playing";
                case 1: return "Streaming";
                case 2: return "Listening to";
                case 3: return "Watching";
                case 4: return "Custom Status";
                case 5: return "Competing in";
                default: return "Doing";
            }
        }

        function activityImageUrl(activity) {
            const largeImage = activity?.assets?.large_image;
            if (!largeImage) return "";
            if (largeImage.startsWith("mp:")) return `https://media.discordapp.net/${largeImage.slice(3)}`;
            if (largeImage.startsWith("spotify:")) return `https://i.scdn.co/image/${largeImage.slice(8)}`;
            if (activity.application_id) return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImage}.png?size=256`;
            return "";
        }

        function avatarUrl(discordUser) {
            if (discordUser?.avatar) {
                return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`;
            }
            return "/Icons/discord.png";
        }

        function platformsToText(data) {
            const active = [];
            if (data.active_on_discord_desktop) active.push("Desktop");
            if (data.active_on_discord_mobile) active.push("Mobile");
            if (data.active_on_discord_web) active.push("Web");
            return active.length > 0 ? active.join(" + ") : "Offline";
        }

        function setActivitiesMessage(message) {
            activitiesListEl.textContent = "";
            const item = document.createElement("article");
            item.className = "discord-activity-item";

            const title = document.createElement("p");
            title.className = "discord-activity-title";
            title.textContent = message;

            item.appendChild(title);
            activitiesListEl.appendChild(item);
        }

        function createActivityLine(className, text) {
            if (!text) return null;
            const line = document.createElement("p");
            line.className = className;
            line.textContent = text;
            return line;
        }

        function createActivityCard(activity) {
            const article = document.createElement("article");
            article.className = "discord-activity-item";

            const layout = document.createElement("div");
            layout.className = "discord-activity-layout";

            const info = document.createElement("div");
            info.className = "discord-activity-info";

            const isCustomStatus = activity.type === 4;
            const emoji = activity.emoji?.name ? `${activity.emoji.name} ` : "";
            const titleText = isCustomStatus
                ? "Custom Status"
                : `${activityTypeToText(activity.type)} ${activity.name || "Activity"}`;
            const detailsText = isCustomStatus
                ? `${emoji}${activity.state || "No status text"}`
                : activity.details || "";
            const stateText = isCustomStatus ? "" : activity.state || "";
            const timeText = timestampToText(activity.timestamps);

            const titleEl = createActivityLine("discord-activity-title", titleText);
            const detailsEl = createActivityLine("discord-activity-details", detailsText);
            const stateEl = createActivityLine("discord-activity-state", stateText);
            const timeEl = createActivityLine("discord-activity-time", timeText);

            if (titleEl) info.appendChild(titleEl);
            if (detailsEl) info.appendChild(detailsEl);
            if (stateEl) info.appendChild(stateEl);
            if (timeEl) info.appendChild(timeEl);

            const imageUrl = activityImageUrl(activity);
            if (imageUrl) {
                const imageAside = document.createElement("aside");
                imageAside.className = "discordActivityImage-aside";

                const image = document.createElement("img");
                image.className = "discord-activity-image";
                image.src = imageUrl;
                image.alt = `${activity.name || "Activity"} artwork`;

                imageAside.appendChild(image);
                layout.appendChild(info);
                layout.appendChild(imageAside);
            } else {
                layout.appendChild(info);
            }

            article.appendChild(layout);
            return article;
        }

        function renderActivities(activities) {
            activitiesListEl.textContent = "";
            const list = Array.isArray(activities) ? activities : [];

            if (!list.length) {
                setActivitiesMessage("No activities right now");
                return;
            }

            list.forEach((activity) => {
                activitiesListEl.appendChild(createActivityCard(activity));
            });
        }

        function renderPresence(data) {
            const discordUser = data.discord_user || {};
            const username = discordUser.username || "Discord user";
            const displayName = discordUser.global_name || username;
            const discriminator = discordUser.discriminator;
            const handle = discriminator && discriminator !== "0"
                ? `${username}#${discriminator}`
                : `@${username}`;
            const status = data.discord_status || "offline";
            const statusText = STATUS_TEXT[status] || STATUS_TEXT.offline;

            nameEl.textContent = displayName;
            handleEl.textContent = handle;
            avatarEl.src = avatarUrl(discordUser);
            statusLabelEl.textContent = statusText;
            statusLabelEl.className = `discord-pill ${status}`;
            dotEl.className = `discord-dot ${status}`;
            platformEl.textContent = `Active on: ${platformsToText(data)}`;
            renderActivities(data.activities);
        }

        function renderPresenceError(message, code) {
            statusLabelEl.textContent = "Unavailable";
            statusLabelEl.className = "discord-pill offline";
            dotEl.className = "discord-dot offline";

            if (code === "user_not_monitored") {
                platformEl.textContent = "Presence requires Lanyard setup";
                setActivitiesMessage("Join lanyard.cnrad.dev and link Discord to show activities.");
                return;
            }

            platformEl.textContent = "Could not reach Discord presence";
            setActivitiesMessage(message || "Presence lookup failed");
        }

        async function updatePresence() {
            try {
                const response = await fetch(LANYARD_URL, { cache: "no-store" });
                const json = await response.json();
                if (!response.ok || !json.success || !json.data) {
                    const message = json?.error?.message || "Invalid response from presence service.";
                    const code = json?.error?.code || "";
                    renderPresenceError(message, code);
                    return;
                }
                renderPresence(json.data);
            } catch (error) {
                renderPresenceError();
            }
        }

        updatePresence();
        setInterval(updatePresence, REFRESH_MS);